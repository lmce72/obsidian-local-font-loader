import { expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';

// 进程隔离避免宿主模块桩影响其他测试；Isolate host mocks from other test suites.
function languageProbe(modern: boolean) {
    return Bun.spawnSync([process.execPath, '--eval', `
        import { mock } from 'bun:test';
        mock.module('obsidian', () => ({
            ${modern ? "getLanguage: () => 'es'," : ''}
            moment: { locale: () => 'zh-tw' },
        }));
        const { t, TRANSLATIONS } = await import('./src/i18n.ts');
        if (t('systemDefault') !== TRANSLATIONS['${modern ? 'es' : 'zh-TW'}'].systemDefault) {
            throw new Error('Incorrect host language');
        }
    `], { cwd: fileURLToPath(new URL('..', import.meta.url)) });
}

test('modern hosts use getLanguage before the date-library locale', () => {
    const result = languageProbe(true);
    expect(result.stderr.toString()).toBe('');
    expect(result.exitCode).toBe(0);
});

test('legacy hosts retain Traditional Chinese without reading localStorage', () => {
    const result = languageProbe(false);
    expect(result.stderr.toString()).toBe('');
    expect(result.exitCode).toBe(0);
});
