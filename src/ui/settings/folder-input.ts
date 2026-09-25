/**
 * A vault folder path input: typing suggests existing folders, and a button opens a picker.
 *
 * Shared by both directory settings rather than written twice. A path typed by hand has to be
 * right to the character and gives no sign when it is not — which is how a mistyped cache
 * directory ends up looking like a conversion failure.
 */

import { AbstractInputSuggest, FuzzySuggestModal, Setting } from 'obsidian';
import type { App } from 'obsidian';
import { TFolder } from 'obsidian';

import { t } from '../../i18n';

/** Suggests the vault's folders while a path is typed. */
class FolderInputSuggest extends AbstractInputSuggest<TFolder> {
    constructor(app: App, textInputEl: HTMLInputElement, private readonly onPick: (path: string) => void) {
        super(app, textInputEl);
    }

    getSuggestions(query: string): TFolder[] {
        const needle = query.toLowerCase();
        return this.vaultFolders().filter(folder => folder.path.toLowerCase().includes(needle));
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.setText(folder.path);
    }

    selectSuggestion(folder: TFolder): void {
        this.setValue(folder.path);
        this.onPick(folder.path);
        this.close();
    }

    private vaultFolders(): TFolder[] {
        return this.app.vault.getAllLoadedFiles()
            .filter((file): file is TFolder => file instanceof TFolder)
            .sort((a, b) => a.path.localeCompare(b.path));
    }
}

/** Picks one of the vault's folders, for the browse button. */
class FolderPickerModal extends FuzzySuggestModal<TFolder> {
    constructor(app: App, private readonly onPick: (path: string) => void) {
        super(app);
        this.setPlaceholder(t('selectFolder'));
    }

    getItems(): TFolder[] {
        return this.app.vault.getAllLoadedFiles()
            .filter((file): file is TFolder => file instanceof TFolder)
            .sort((a, b) => a.path.localeCompare(b.path));
    }

    getItemText(folder: TFolder): string {
        return folder.path;
    }

    onChooseItem(folder: TFolder): void {
        this.onPick(folder.path);
    }
}

/**
 * Adds a folder path field and a browse button to a setting.
 *
 * The caller keeps its own persistence: both the typed and the picked path are reported through
 * the same callback, so they cannot end up handled differently.
 *
 * @param setting - The setting to extend
 * @param app - The app, for the vault index and the picker
 * @param initialValue - The path to show
 * @param onChange - Called with the typed or picked path
 * @param placeholder - Shown while the field is empty
 */
export function addFolderPathInput(
    setting: Setting,
    app: App,
    initialValue: string,
    onChange: (value: string) => void,
    placeholder = ''
): void {
    let field: { setValue(value: string): unknown } | null = null;

    setting.addText(text => {
        field = text;
        text.setValue(initialValue);
        if (placeholder) {
            text.setPlaceholder(placeholder);
        }
        text.onChange(value => onChange(value));

        // The suggester takes the element the Setting built, so autocomplete and the field are
        // the same input rather than two that have to be kept in step.
        new FolderInputSuggest(app, text.inputEl, path => {
            text.setValue(path);
            onChange(path);
        });
    });

    setting.addButton(button => button
        .setButtonText(t('browseFolder'))
        .setTooltip(t('browseFolderDesc'))
        .onClick(() => {
            new FolderPickerModal(app, path => {
                // setValue only updates the field; persistence goes through the one callback.
                field?.setValue(path);
                onChange(path);
            }).open();
        })
    );
}
