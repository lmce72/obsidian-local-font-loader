import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(join(root, '.compat-check-'));
try {
    // 只读取官方 SDK 的单个声明文件；Never extract arbitrary archive paths.
    const response = await fetch('https://registry.npmjs.org/obsidian/-/obsidian-1.5.7.tgz', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Could not download legacy SDK: HTTP ${response.status}`);
    const tar = gunzipSync(Buffer.from(await response.arrayBuffer()));
    let declaration;
    for (let offset = 0; offset + 512 <= tar.length;) {
        const name = tar.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
        const size = Number.parseInt(tar.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
        if (name === 'package/obsidian.d.ts') declaration = tar.subarray(offset + 512, offset + 512 + size);
        offset += 512 + Math.ceil(size / 512) * 512;
    }
    if (!declaration) throw new Error('Legacy SDK declaration is missing');
    await writeFile(join(temporary, 'obsidian.d.ts'), declaration);
    await writeFile(join(temporary, 'tsconfig.json'), JSON.stringify({
        extends: '../tsconfig.json',
        compilerOptions: { paths: { obsidian: ['./obsidian.d.ts'] }, types: ['node'] },
        include: ['../src/**/*.ts'],
    }));
    execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', join(temporary, 'tsconfig.json')], { cwd: root, stdio: 'inherit', timeout: 5000, windowsHide: true });
    console.log('Obsidian 1.5.7 SDK compatibility passed.');
} finally {
    // 删除范围限定在本次创建的目录；Validate the cleanup boundary before recursive removal.
    if (dirname(temporary) !== root || !temporary.startsWith(join(root, '.compat-check-'))) throw new Error('Invalid temporary directory');
    await rm(temporary, { recursive: true, force: true });
}
