/**
 * OpenType / TrueType name-table reader.
 */

/**
 * Parse font file metadata (read OpenType/TrueType name table)
 * @param {ArrayBuffer} arrayBuffer - Binary data of the font file
 * @returns {Object|null} Font metadata or null if parsing fails
 */
export function parseFontMetadata(arrayBuffer) {
    try {
        const dataView = new DataView(arrayBuffer);

        // Read font table directory
        const numTables = dataView.getUint16(4);

        // Find name table
        let nameTableOffset = null;
        for (let i = 0; i < numTables; i++) {
            const tableOffset = 12 + i * 16;
            const tag = String.fromCharCode(
                dataView.getUint8(tableOffset),
                dataView.getUint8(tableOffset + 1),
                dataView.getUint8(tableOffset + 2),
                dataView.getUint8(tableOffset + 3)
            );

            if (tag === 'name') {
                nameTableOffset = dataView.getUint32(tableOffset + 8);
                break;
            }
        }

        if (!nameTableOffset) {
            return null;
        }

        // Parse name table
        const nameTable = {
            format: dataView.getUint16(nameTableOffset),
            count: dataView.getUint16(nameTableOffset + 2),
            stringOffset: dataView.getUint16(nameTableOffset + 4)
        };

        const nameRecords = [];
        for (let i = 0; i < nameTable.count; i++) {
            const recordOffset = nameTableOffset + 6 + i * 12;
            nameRecords.push({
                platformID: dataView.getUint16(recordOffset),
                encodingID: dataView.getUint16(recordOffset + 2),
                languageID: dataView.getUint16(recordOffset + 4),
                nameID: dataView.getUint16(recordOffset + 6),
                length: dataView.getUint16(recordOffset + 8),
                offset: dataView.getUint16(recordOffset + 10)
            });
        }

        // Extract key information
        const metadata = {
            familyName: null,
            subfamilyName: null,
            fullName: null,
            postScriptName: null
        };

        const stringStorageOffset = nameTableOffset + nameTable.stringOffset;

        for (const record of nameRecords) {
            const stringOffset = stringStorageOffset + record.offset;
            let value = '';

            // Prefer Windows platform Unicode encoding
            if (record.platformID === 3 && record.encodingID === 1) {
                for (let j = 0; j < record.length; j += 2) {
                    const charCode = dataView.getUint16(stringOffset + j);
                    if (charCode > 0) {
                        value += String.fromCharCode(charCode);
                    }
                }
            } else if (record.platformID === 1) {
                // Mac platform ASCII encoding
                for (let j = 0; j < record.length; j++) {
                    value += String.fromCharCode(dataView.getUint8(stringOffset + j));
                }
            }

            if (!value) continue;

            // Name ID mapping: 1=Family, 2=Subfamily, 4=Full, 6=PostScript
            switch (record.nameID) {
                case 1:
                    if (!metadata.familyName) metadata.familyName = value;
                    break;
                case 2:
                    if (!metadata.subfamilyName) metadata.subfamilyName = value;
                    break;
                case 4:
                    if (!metadata.fullName) metadata.fullName = value;
                    break;
                case 6:
                    if (!metadata.postScriptName) metadata.postScriptName = value;
                    break;
            }
        }

        // Parse style information (four variants)
        const subfamily = (metadata.subfamilyName || '').toLowerCase();
        const isItalic = subfamily.includes('italic') || subfamily.includes('oblique');
        const isBold = subfamily.includes('bold') || subfamily.includes('heavy') || subfamily.includes('black');

        // Determine variant type: regular, italic, bold, bolditalic
        let variantType = 'regular';
        if (isBold && isItalic) {
            variantType = 'bolditalic';
        } else if (isBold) {
            variantType = 'bold';
        } else if (isItalic) {
            variantType = 'italic';
        }

        // Map CSS font-weight
        let weight = 400;
        if (subfamily.includes('thin') || subfamily.includes('hairline')) {
            weight = 100;
        } else if (subfamily.includes('extralight') || subfamily.includes('ultralight')) {
            weight = 200;
        } else if (subfamily.includes('light')) {
            weight = 300;
        } else if (subfamily.includes('medium')) {
            weight = 500;
        } else if (subfamily.includes('semibold') || subfamily.includes('demibold')) {
            weight = 600;
        } else if (subfamily.includes('bold')) {
            weight = 700;
        } else if (subfamily.includes('extrabold') || subfamily.includes('ultrabold')) {
            weight = 800;
        } else if (subfamily.includes('black') || subfamily.includes('heavy')) {
            weight = 900;
        }

        return {
            familyName: metadata.familyName,
            subfamilyName: metadata.subfamilyName,
            fullName: metadata.fullName,
            postScriptName: metadata.postScriptName,
            variantType,  // 'regular', 'italic', 'bold', 'bolditalic'
            style: {
                isItalic,
                isBold,
                weight,
                cssStyle: isItalic ? 'italic' : 'normal'
            }
        };

    } catch (error) {
        // Standalone function: "this" is not bound here; log directly to console to avoid masking the real parse error
        console.error('[Font Metadata] Parse failed:', error);
        return null;
    }
}
