/**
 * Modal components — they replace the browser-native prompt/confirm, which would
 * steal window focus from Obsidian.
 */
import { Modal, ConfirmationModal, setIcon } from 'obsidian';

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

    constructor(app, title, placeholder, defaultValue, onSubmit) {
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

    constructor(app, plugin, onImport) {
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
        const input = document.createElement('input');
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

            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;

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
export function showConfirmDialog(app, title, message, onConfirm, isDangerous = false) {
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
