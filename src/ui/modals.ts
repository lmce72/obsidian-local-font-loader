/**
 * Modal components — they replace the browser-native prompt/confirm, which would
 * steal window focus from Obsidian.
 */
import { App, Modal, ConfirmationModal, setIcon } from 'obsidian';

import { t } from '../i18n';

/**
 * Text input modal (replaces prompt)
 * Uses the Obsidian native Modal API to avoid window focus loss from the browser-native prompt
 * @class TextInputModal
 * @extends {Modal}
 */
export class TextInputModal extends Modal {
    titleText: string;
    placeholder: string;
    defaultValue: string;
    onSubmit: (value: string) => void;

    constructor(app: App, title: string, placeholder: string, defaultValue: string, onSubmit: (value: string) => void) {
        super(app);
        this.titleText = title;
        this.placeholder = placeholder;
        this.defaultValue = defaultValue || '';
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        titleEl.setText(this.titleText);

        // Create the input (using native createEl)
        const inputEl = contentEl.createEl('input', {
            type: 'text',
            value: this.defaultValue,
            placeholder: this.placeholder,
            cls: 'lfl-text-input',
            attr: {
                'aria-label': this.titleText
            }
        });

        // Create the button container
        // `modal-button-container` is Obsidian's own class, kept so the button row inherits the
        // app's styling; the plugin class only pins the layout the modal had before.
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container lfl-modal-buttons' });

        // Cancel button
        const cancelBtn = buttonContainer.createEl('button', { text: t('cancel') });
        cancelBtn.addEventListener('click', () => this.close());

        // Confirm button (primary action)
        const submitBtn = buttonContainer.createEl('button', {
            text: t('confirm'),
            cls: 'mod-cta'
        });
        submitBtn.addEventListener('click', () => {
            const value = inputEl.value.trim();
            if (value) {
                this.onSubmit(value);
                this.close();
            } else {
                // Highlight the input border when empty
                inputEl.addClass('is-invalid');
                inputEl.focus();
            }
        });

        // Enter to submit, ESC to cancel
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });

        // Remove the error style on input
        inputEl.addEventListener('input', () => {
            inputEl.removeClass('is-invalid');
        });

        // Auto-focus and select the text (for quick edits)
        window.setTimeout(() => {
            inputEl.focus();
            inputEl.select();
        }, 10);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Drag-and-drop import modal (avoids the user-activation issue of the file chooser)
 */
export class FontImportModal extends Modal {
    plugin: { settings: { fontSourceDir: string }; saveSettings: () => Promise<void> };
    onImport: (files: FileList) => void | Promise<void>;

    constructor(app: App, plugin: { settings: { fontSourceDir: string }; saveSettings: () => Promise<void> }, onImport: (files: FileList) => void | Promise<void>) {
        super(app);
        this.plugin = plugin;
        this.onImport = onImport;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        titleEl.setText(t('importFont'));

        // Drop zone
        const dropZone = contentEl.createDiv({ cls: 'lfl-import-dropzone' });

        const iconContainer = dropZone.createDiv({ cls: 'lfl-import-icon' });
        setIcon(iconContainer, 'folder');

        dropZone.createDiv({ cls: 'lfl-import-title', text: t('importDropTitle') });
        dropZone.createDiv({ cls: 'lfl-import-subtitle', text: t('importDropSubtitle') });
        dropZone.createDiv({ cls: 'lfl-import-hint', text: t('importDropHint') });

        // Create a hidden input (inside the Modal)
        const input = createEl('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.ttf,.otf,.woff,.woff2';
        input.addClass('lfl-hidden-input');
        contentEl.appendChild(input);

        // Click the zone to trigger file selection
        dropZone.onclick = () => {
            input.click();
        };

        // File selection handler
        input.onchange = async () => {
            const files = input.files;
            if (!files || files.length === 0) return;

            this.close();
            await this.onImport(files);
        };

        // Drag-and-drop handlers
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.addClass('is-dragover');
        };

        dropZone.ondragleave = () => {
            dropZone.removeClass('is-dragover');
        };

        dropZone.ondrop = async (e) => {
            e.preventDefault();
            dropZone.removeClass('is-dragover');

            const transfer = e.dataTransfer;
            if (!transfer) return;

            const files = transfer.files;
            if (files.length === 0) return;

            this.close();
            await this.onImport(files);
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Confirmation dialog helper (replaces confirm)
 * @param {App} app - The Obsidian App instance
 * @param {string} title - The dialog title
 * @param {string} message - The confirmation message
 * @param {Function} onConfirm - The confirmation callback
 * @param {boolean} isDangerous - Whether this is a dangerous operation (applies warning styling)
 */
export function showConfirmDialog(
    app: App,
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    isDangerous = false
) {
    const modal = new ConfirmationModal(app);
    modal.setTitle(title);

    // Create the message content
    modal.contentEl.createEl('p', {
        text: message,
        cls: 'lfl-confirm-message'
    });

    // Add the confirm button
    modal.addButton((btn) => {
        btn.setButtonText(t('confirm'));
        btn.setCta();
        if (isDangerous) {
            btn.buttonEl.addClass('mod-warning'); // dangerous operation, applies warning styling
        }
        btn.onClick(() => {
            onConfirm();
        });
    });

    // Add the cancel button
    modal.addCancelButton(t('cancel'));

    modal.open();
}

/**
 * One font category's adaptation status, as the status modal renders it.
 *
 * "Adaptation method" is the interesting field: a font can be handled by more than one layer — a
 * family adapter reading its own metrics, then the measurement fallback covering whatever that
 * family does not ship — so the modal states which layers are actually in play rather than only
 * naming the font.
 */

/**
 * One font category's adaptation status, as the status modal shows it.
 *
 * The point of the modal is the `adaptation` list: a category is often served by more than one
 * layer — a family adapter reading that family's own metrics, with something else covering what the
 * family does not ship — and naming only the font would hide that entirely.
 */
export interface FontStatusRow {
    /** Category name, e.g. "Text" or "Math". Rendered as the card's heading. */
    category: string;
    /** The configured family name, or empty when the category has none. */
    family: string;
    /**
     * How the metrics are obtained, in order of application. Each entry is plain language —
     * "Read from the font file" rather than an adapter id — because this is read by a person
     * deciding whether the numbers behind their formula are trustworthy.
     */
    adaptation: string[];
    /** Where the numbers came from, in plain language. */
    source: string;
    /** The font files the scan found, e.g. "regular, bold". */
    files: string;
    /** Coverage gaps, phrased so it is clear what falls back to MathJax. */
    gaps: string[];
}

/**
 * Modal listing every font category, the font it uses, and how that font's metrics are obtained.
 */
export class FontStatusModal extends Modal {
    rows: FontStatusRow[];

    constructor(app: App, rows: FontStatusRow[]) {
        super(app);
        this.rows = rows;
    }

    onOpen(): void {
        const { contentEl, titleEl } = this;
        titleEl.setText(t('fontStatusTitle') || 'Font status');

        contentEl.addClass('lfl-font-status');
        contentEl.createEl('p', {
            cls: 'lfl-font-status-intro',
            text: t('fontStatusIntro') || 'Which font each category uses, and where its metrics come from.',
        });

        for (const row of this.rows) {
            contentEl.appendChild(this.renderRow(row));
        }

        const footer = contentEl.createDiv({ cls: 'lfl-font-status-footer' });
        const closeEl = footer.createEl('button', { cls: 'mod-cta', text: t('fontStatusClose') || 'Close' });
        closeEl.addEventListener('click', () => this.close());
    }

    /** One category card: heading, the font, then the fields. */
    private renderRow(row: FontStatusRow): HTMLElement {
        const card = createDiv({ cls: 'lfl-font-status-card' });

        card.createDiv({ cls: 'lfl-font-status-category', text: row.category });

        const fontEl = card.createDiv({ cls: 'lfl-font-status-font' });
        fontEl.createSpan({ cls: 'lfl-font-status-label', text: t('fontStatusFont') || 'Font' });
        fontEl.createSpan({
            cls: 'lfl-font-status-value lfl-font-status-value-strong',
            text: row.family || (t('fontStatusNone') || 'None'),
        });

        if (row.files) {
            const filesEl = card.createDiv({ cls: 'lfl-font-status-field' });
            filesEl.createSpan({ cls: 'lfl-font-status-label', text: t('fontStatusFiles') || 'Files' });
            filesEl.createSpan({ cls: 'lfl-font-status-value', text: row.files });
        }

        if (row.family) {
            const howEl = card.createDiv({ cls: 'lfl-font-status-field lfl-font-status-field-stack' });
            howEl.createSpan({
                cls: 'lfl-font-status-label',
                text: t('fontStatusHow') || 'How the metrics are obtained',
            });

            const list = howEl.createEl('ol', { cls: 'lfl-font-status-steps' });
            const steps = row.adaptation.length > 0
                ? row.adaptation
                : [t('fontStatusPending') || 'Waiting for the font to be resolved'];
            for (const step of steps) {
                list.createEl('li', { cls: 'lfl-font-status-step', text: step });
            }

            if (row.source) {
                const sourceEl = card.createDiv({ cls: 'lfl-font-status-field' });
                sourceEl.createSpan({ cls: 'lfl-font-status-label', text: t('fontStatusSource') || 'Source' });
                sourceEl.createSpan({ cls: 'lfl-font-status-value', text: row.source });
            }

            if (row.gaps.length > 0) {
                const gapsEl = card.createDiv({ cls: 'lfl-font-status-field lfl-font-status-field-stack' });
                gapsEl.createSpan({ cls: 'lfl-font-status-label', text: t('fontStatusGaps') || 'Not covered' });
                for (const gap of row.gaps) {
                    gapsEl.createDiv({ cls: 'lfl-font-status-gap', text: gap });
                }
            }
        }

        return card;
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
