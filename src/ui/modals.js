/**
 * Modal components — they replace the browser-native prompt/confirm, which would
 * steal window focus from Obsidian.
 */
import { Modal, ConfirmationModal, Notice, Setting, setIcon } from 'obsidian';

import { t } from '../i18n.js';

/**
 * Text input modal (replaces prompt)
 * Uses the Obsidian native Modal API to avoid window focus loss from the browser-native prompt
 * @class TextInputModal
 * @extends {Modal}
 */
export class TextInputModal extends Modal {
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
            attr: {
                'aria-label': this.titleText
            }
        });

        // Style setup (using Obsidian CSS variables)
        inputEl.style.width = '100%';
        inputEl.style.marginBottom = '16px';
        inputEl.style.padding = '8px';
        inputEl.style.fontSize = '14px';
        inputEl.style.border = '1px solid var(--background-modifier-border)';
        inputEl.style.borderRadius = '4px';
        inputEl.style.backgroundColor = 'var(--background-primary)';
        inputEl.style.color = 'var(--text-normal)';

        // Create the button container
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginTop = '16px';

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
                inputEl.style.borderColor = 'var(--text-error)';
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
            inputEl.style.borderColor = 'var(--background-modifier-border)';
        });

        // Auto-focus and select the text (for quick edits)
        setTimeout(() => {
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
    constructor(app, plugin, onImport) {
        super(app);
        this.plugin = plugin;
        this.onImport = onImport;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        titleEl.setText(t('importFont'));

        // Drop zone
        const dropZone = contentEl.createDiv({
            cls: 'font-import-dropzone',
            attr: {
                style: `
                    border: 2px dashed var(--interactive-accent);
                    border-radius: 8px;
                    padding: 60px 40px;
                    text-align: center;
                    background: var(--background-secondary);
                    cursor: pointer;
                    transition: background 0.2s ease;
                `
            }
        });

        const iconContainer = dropZone.createDiv({
            cls: 'font-import-icon',
            attr: {
                style: `
                    margin-bottom: 16px;
                    color: var(--interactive-accent);
                `
            }
        });
        setIcon(iconContainer, 'folder');
        // Set the icon size
        const iconSvg = iconContainer.querySelector('svg');
        if (iconSvg) {
            iconSvg.setAttribute('width', '48');
            iconSvg.setAttribute('height', '48');
            iconSvg.style.display = 'block';
            iconSvg.style.margin = '0 auto';
        }

        const title = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-normal);
                `
            },
            text: '拖拽字体文件到此处'
        });

        const subtitle = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                `
            },
            text: '或点击选择文件'
        });

        const hint = dropZone.createDiv({
            attr: {
                style: `
                    font-size: 12px;
                    color: var(--text-faint);
                `
            },
            text: '支持 .ttf, .otf, .woff, .woff2 格式'
        });

        // Create a hidden input (inside the Modal)
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.ttf,.otf,.woff,.woff2';
        input.style.display = 'none';
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
            dropZone.style.background = 'var(--background-modifier-hover)';
        };

        dropZone.ondragleave = () => {
            dropZone.style.background = 'var(--background-secondary)';
        };

        dropZone.ondrop = async (e) => {
            e.preventDefault();
            dropZone.style.background = 'var(--background-secondary)';

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
        attr: { style: 'margin-bottom: 16px;' }
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
