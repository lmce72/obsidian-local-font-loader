# Publishing Guide

This guide covers how to publish the **Obsidian Local Font Loader** plugin to GitHub and submit it to the Obsidian Community Plugins store.

---

## Part 1: Publishing to GitHub

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top-right corner and select **"New repository"**
3. Configure your repository:
   - **Repository name**: `obsidian-local-font-loader`
   - **Description**: "A powerful Obsidian plugin for loading and managing custom fonts directly from your local vault"
   - **Visibility**: Public (required for Obsidian Community Plugins)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Step 2: Push Your Code

⚠️ **IMPORTANT**: The repository is already initialized with a clean commit and a tag `1.0.0` (without 'v' prefix). This matches the version in `manifest.json` and is required by Obsidian Community Plugins.

In your terminal, navigate to the plugin directory and run:

```bash
cd ~/obsidian-local-font-loader

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/obsidian-local-font-loader.git

# Push code AND tags to GitHub (--tags is critical!)
git push -u origin main --tags
```

✅ **Verify**: After pushing, check that:
- Your repository shows the tag `1.0.0` in the "Tags" section
- The tag does NOT have a 'v' prefix (should be `1.0.0`, not `v1.0.0`)

### Step 3: Create a GitHub Release

1. On your GitHub repository page, click **"Releases"** (right sidebar)
2. Click **"Create a new release"**
3. Configure the release:
   - **Tag**: Select `1.0.0` from the dropdown (the tag we just pushed)
   - **Release title**: `1.0.0` or `Local Font Loader v1.0.0`
   - **Description**: Write release notes, for example:
     ```
     ## Initial Release
     
     ### Features
     - 📁 Local font management (TTF/OTF/WOFF/WOFF2)
     - 🎨 Font categories: UI, Body Text, Code, LaTeX Math
     - ⚡ Base64 caching system for offline usage
     - 🌍 Latin font separation with unicode-range control
     - 🔄 Font family variant detection (Regular/Italic/Bold/BoldItalic)
     - ⚙️ Full-featured settings tab
     - 🚀 Auto-load on startup option
     
     ### Installation
     Download `main.js` and `manifest.json` below and place them in:
     `<vault>/.obsidian/plugins/obsidian-local-font-loader/`
     ```
4. **Attach binary files**: Upload these files from your local plugin directory:
   - `main.js`
   - `manifest.json`
   - `styles.css` (if you have one)
   
5. Click **"Publish release"**

✅ **Verify**: Your release should show:
- Tag: `1.0.0` (without 'v')
- Assets: `main.js`, `manifest.json` (and `styles.css` if applicable)

---

## Part 2: Submit to Obsidian Community Plugins

### Prerequisites

- Your GitHub repository must be public
- You must have a valid GitHub Release with `main.js` and `manifest.json` as assets
- The release tag must match the `version` field in `manifest.json` **exactly** (no 'v' prefix)

### Step 1: Fork the Obsidian Releases Repository

1. Go to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
2. Click **"Fork"** in the top-right corner
3. Wait for the fork to complete

### Step 2: Add Your Plugin Entry

1. In your forked repository, navigate to `community-plugins.json`
2. Click the **edit icon** (pencil)
3. Add your plugin entry to the JSON array. Insert it alphabetically by `id`:

```json
{
  "id": "obsidian-local-font-loader",
  "name": "Local Font Loader",
  "author": "CoreVortex",
  "description": "Load and manage custom fonts directly from your local vault with support for multiple font categories and Base64 caching",
  "repo": "YOUR_USERNAME/obsidian-local-font-loader"
}
```

⚠️ **Replace** `YOUR_USERNAME` with your actual GitHub username!

4. Commit the changes directly to your fork's `main` branch

### Step 3: Create a Pull Request

1. Go back to your fork's main page
2. Click **"Contribute"** → **"Open pull request"**
3. Fill in the PR details:
   - **Title**: `Add Local Font Loader plugin`
   - **Description**: 
     ```
     ## Plugin Information
     - **Name**: Local Font Loader
     - **Author**: CoreVortex
     - **Repository**: https://github.com/YOUR_USERNAME/obsidian-local-font-loader
     - **Release**: https://github.com/YOUR_USERNAME/obsidian-local-font-loader/releases/tag/1.0.0
     
     ## Description
     A powerful Obsidian plugin for loading and managing custom fonts directly from your local vault. Supports TTF/OTF/WOFF/WOFF2 formats with Base64 caching, font categories (UI/Text/Code/Math), and Latin font separation.
     
     ## Checklist
     - [x] Plugin is published under MIT license
     - [x] Repository is public
     - [x] Release tag matches manifest version (1.0.0)
     - [x] Release includes main.js and manifest.json
     - [x] README includes installation instructions
     ```
4. Click **"Create pull request"**

### Step 4: Wait for Review

- The Obsidian team will review your submission
- This typically takes **1-2 weeks**
- You may receive feedback or requests for changes
- Once approved, your plugin will appear in the Community Plugins browser

---

## Updating Your Plugin (Future Releases)

When you release a new version:

1. **Update `manifest.json`**: Change the `version` field (e.g., `"1.1.0"`)
2. **Commit and push**: `git commit -am "Bump version to 1.1.0" && git push`
3. **Create a new tag**: `git tag 1.1.0 && git push --tags`
4. **Create a new GitHub Release**: Same process as Step 3 above, using the new tag
5. The Obsidian Community Plugins store will **automatically** pick up the new version (no PR needed)

---

## Common Issues

### "No release matches your manifest version"

**Cause**: Your release tag doesn't exactly match the `version` field in `manifest.json`.

**Solution**:
- Ensure your git tag is `1.0.0` (not `v1.0.0`)
- Ensure `manifest.json` has `"version": "1.0.0"`
- Delete any incorrect tags: `git tag -d v1.0.0 && git push origin :refs/tags/v1.0.0`
- Create the correct tag: `git tag 1.0.0 && git push --tags`

### "Plugin ID mismatch"

**Cause**: The `id` in `manifest.json` doesn't match the folder name or entry in `community-plugins.json`.

**Solution**: Ensure all three match exactly:
- Folder name: `obsidian-local-font-loader`
- `manifest.json`: `"id": "obsidian-local-font-loader"`
- `community-plugins.json`: `"id": "obsidian-local-font-loader"`

### "Missing main.js or manifest.json in release"

**Cause**: You forgot to attach the required files to your GitHub Release.

**Solution**:
1. Go to your release page
2. Click **"Edit"**
3. Upload `main.js` and `manifest.json` under "Attach binaries"
4. Click **"Update release"**

---

## Support

If you encounter issues during publication:
- Check [Obsidian Developer Docs](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- Ask in the [Obsidian Discord](https://discord.gg/obsidianmd) #plugin-dev channel
- Review other plugin PRs in [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases/pulls)

---

Good luck with your plugin publication! 🚀
