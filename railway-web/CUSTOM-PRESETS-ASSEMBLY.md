# 🎯 CUSTOM PRESETS - ASSEMBLY INSTRUCTIONS

## 📋 Overview
This guide shows you exactly how to integrate the Custom Presets system into your index.html file.

---

## ✅ FILES CREATED
- `custom-presets.js` - Core logic (✅ Complete)
- `custom-presets-modal.html` - Modal HTML (✅ Complete)
- `custom-presets.css` - Styling (✅ Complete)

---

## 🔧 STEP-BY-STEP INTEGRATION

### **STEP 1: Add CSS Link** (in `<head>` section)

Find this line in `index.html`:
```html
<link rel="stylesheet" href="styles.css">
```

**ADD THIS LINE AFTER IT:**
```html
<link rel="stylesheet" href="custom-presets.css">
```

---

### **STEP 2: Add Custom Presets Button** (in Wallet Modal)

Find the wallet modal's header in `index.html` around line ~3800:
```html
<div class="sub-modal-header">
    <span class="sub-modal-icon">🔐</span>
    <span class="sub-modal-title">Import Wallet</span>
    <button class="sub-modal-close" id="closeWalletModal">×</button>
</div>
```

**REPLACE WITH THIS (adds tabs):**
```html
<div class="sub-modal-header">
    <span class="sub-modal-icon">🔐</span>
    <span class="sub-modal-title">Wallet & Presets</span>
    <button class="sub-modal-close" id="closeWalletModal">×</button>
</div>

<div class="wallet-modal-tabs">
    <button class="wallet-tab-btn active" data-wallet-tab="import">Import Wallet</button>
    <button class="wallet-tab-btn" data-wallet-tab="presets">Custom Presets</button>
</div>
```

---

### **STEP 3: Wrap Wallet Content** (add tab containers)

Find the wallet modal body (starts with `<div class="sub-modal-body">`).

**WRAP THE ENTIRE WALLET IMPORT FORM** like this:
```html
<div class="wallet-tab-content active" id="wallet-import-tab">
    <!-- EXISTING WALLET IMPORT FORM STAYS HERE -->
    <div class="wallet-import-form">
        ...all existing wallet import code...
    </div>
</div>

<div class="wallet-tab-content" id="wallet-presets-tab">
    <div id="customPresetsContainer">
        <!-- Custom presets will load here -->
    </div>
</div>
```

---

### **STEP 4: Copy Modal HTML** (before `</body>`)

Find the closing `</body>` tag near the end of `index.html`.

**BEFORE `</body>`, COPY THE ENTIRE CONTENTS** of `custom-presets-modal.html`.

This adds the Custom Presets modal.

---

### **STEP 5: Add JavaScript** (before `</body>`)

Find these script tags near the end:
```html
<script src="renderer.js"></script>
</body>
```

**ADD THIS LINE BEFORE renderer.js:**
```html
<script src="custom-presets.js"></script>
<script src="renderer.js"></script>
</body>
```

---

### **STEP 6: Add Tab Switching Logic** (in existing `<script>` section)

Find the wallet modal script section (search for `walletModalBtn`).

**ADD THIS CODE AFTER THE WALLET MODAL INITIALIZATION:**

```javascript
// Wallet Modal Tabs
const walletTabs = document.querySelectorAll('.wallet-tab-btn');
const walletTabContents = document.querySelectorAll('.wallet-tab-content');

walletTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.dataset.walletTab;
        
        // Remove active from all
        walletTabs.forEach(t => t.classList.remove('active'));
        walletTabContents.forEach(c => c.classList.remove('active'));
        
        // Add active to clicked
        this.classList.add('active');
        document.getElementById(`wallet-${tabName}-tab`).classList.add('active');
        
        // If switching to presets tab, load presets
        if (tabName === 'presets') {
            const container = document.getElementById('customPresetsContainer');
            if (container && !container.dataset.loaded) {
                container.innerHTML = `
                    <button class="add-preset-btn" onclick="openCustomPresetsModal()">
                        ⚙️ Manage Custom Presets
                    </button>
                    <p style="color:#666;margin-top:15px;font-size:13px;">
                        Create custom deploy presets with keybinds to quickly deploy tokens
                        from highlighted text in tweets.
                    </p>
                `;
                container.dataset.loaded = 'true';
            }
        }
    });
});

// Open Custom Presets Modal
function openCustomPresetsModal() {
    const modal = document.getElementById('customPresetsModal');
    if (modal) {
        modal.style.display = 'flex';
        // Render presets list
        if (window.customPresetsSystem) {
            window.customPresetsSystem.renderPresetsList(document.getElementById('presetsList'));
        }
    }
}

// Custom Presets Modal Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const presetsModal = document.getElementById('customPresetsModal');
    const closePresetsModal = document.getElementById('closeCustomPresetsModal');
    const addPresetBtn = document.getElementById('addPresetBtn');
    const cancelPresetForm = document.getElementById('cancelPresetForm');
    const savePresetBtn = document.getElementById('savePresetBtn');
    const setKeybindBtn = document.getElementById('setKeybindBtn');
    const clearKeybindBtn = document.getElementById('clearKeybindBtn');
    const tickerModeSelect = document.getElementById('tickerModeSelect');
    const imageTypeSelect = document.getElementById('imageTypeSelect');
    
    // Close modal
    closePresetsModal?.addEventListener('click', () => {
        presetsModal.style.display = 'none';
        document.getElementById('presetsListView').style.display = 'block';
        document.getElementById('addPresetForm').style.display = 'none';
    });
    
    // Add new preset
    addPresetBtn?.addEventListener('click', () => {
        document.getElementById('presetsListView').style.display = 'none';
        document.getElementById('addPresetForm').style.display = 'block';
        // Reset form
        document.getElementById('presetNameInput').value = '';
        document.getElementById('namePrefix').value = '';
        document.getElementById('nameSuffix').value = '';
        document.getElementById('platformSelect').value = 'default';
        document.getElementById('tickerModeSelect').value = 'selected';
        document.getElementById('imageTypeSelect').value = 'post';
        document.getElementById('customTickerInput').value = '';
        document.getElementById('customImageUrlInput').value = '';
        document.getElementById('translateChineseCheck').checked = false;
        document.getElementById('keybindDisplay').textContent = 'Not Set';
        document.getElementById('keybindDisplay').classList.remove('set');
        delete document.getElementById('addPresetForm').dataset.editIdx;
        delete document.getElementById('addPresetForm').dataset.keybind;
    });
    
    // Cancel form
    cancelPresetForm?.addEventListener('click', () => {
        document.getElementById('presetsListView').style.display = 'block';
        document.getElementById('addPresetForm').style.display = 'none';
    });
    
    // Ticker mode change
    tickerModeSelect?.addEventListener('change', function() {
        const customInput = document.getElementById('customTickerInput');
        if (this.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    });
    
    // Image type change
    imageTypeSelect?.addEventListener('change', function() {
        const customInput = document.getElementById('customImageUrlInput');
        if (this.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    });
    
    // Keybind capture
    let capturingKeybind = false;
    
    setKeybindBtn?.addEventListener('click', function() {
        if (!capturingKeybind) {
            capturingKeybind = true;
            this.textContent = 'Press any key...';
            this.classList.add('capturing');
            
            const handler = function(e) {
                e.preventDefault();
                
                const modifiers = [];
                if (e.ctrlKey) modifiers.push('Ctrl');
                if (e.altKey) modifiers.push('Alt');
                if (e.shiftKey) modifiers.push('Shift');
                
                const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
                const keybind = modifiers.length > 0 ? modifiers.join('+') + '+' + key : key;
                
                document.getElementById('keybindDisplay').textContent = keybind;
                document.getElementById('keybindDisplay').classList.add('set');
                document.getElementById('addPresetForm').dataset.keybind = keybind;
                document.getElementById('clearKeybindBtn').style.display = 'block';
                
                setKeybindBtn.textContent = 'Set Keybind';
                setKeybindBtn.classList.remove('capturing');
                capturingKeybind = false;
                
                document.removeEventListener('keydown', handler);
            };
            
            document.addEventListener('keydown', handler);
        }
    });
    
    // Clear keybind
    clearKeybindBtn?.addEventListener('click', function() {
        document.getElementById('keybindDisplay').textContent = 'Not Set';
        document.getElementById('keybindDisplay').classList.remove('set');
        delete document.getElementById('addPresetForm').dataset.keybind;
        this.style.display = 'none';
    });
    
    // Save preset
    savePresetBtn?.addEventListener('click', function() {
        const presetData = {
            name: document.getElementById('presetNameInput').value.trim(),
            namePrefix: document.getElementById('namePrefix').value.trim(),
            nameSuffix: document.getElementById('nameSuffix').value.trim(),
            platform: document.getElementById('platformSelect').value,
            tickerMode: document.getElementById('tickerModeSelect').value,
            customTicker: document.getElementById('customTickerInput').value.trim(),
            imageType: document.getElementById('imageTypeSelect').value,
            customImageUrl: document.getElementById('customImageUrlInput').value.trim(),
            keybind: document.getElementById('addPresetForm').dataset.keybind || '',
            translateChinese: document.getElementById('translateChineseCheck').checked
        };
        
        if (!presetData.name) {
            alert('Please enter a preset name!');
            return;
        }
        
        const editIdx = document.getElementById('addPresetForm').dataset.editIdx;
        const idx = editIdx !== undefined ? parseInt(editIdx) : null;
        
        if (window.customPresetsSystem) {
            window.customPresetsSystem.savePreset(presetData, idx);
            window.customPresetsSystem.renderPresetsList(document.getElementById('presetsList'));
        }
        
        // Back to list view
        document.getElementById('presetsListView').style.display = 'block';
        document.getElementById('addPresetForm').style.display = 'none';
        
        window.showToast('✅ Saved!', 'Preset saved successfully', 'success');
    });
});
```

---

## 🎯 QUICK VERIFICATION CHECKLIST

After integration, check:
- [ ] CSS link added to `<head>`
- [ ] Wallet modal has two tabs (Import Wallet / Custom Presets)
- [ ] Modal HTML added before `</body>`
- [ ] custom-presets.js loaded before renderer.js
- [ ] Tab switching code added
- [ ] Custom Presets modal opens when clicking "Manage Custom Presets"

---

## 🚀 HOW TO USE (After Integration)

### **Create a Preset:**
1. Click 🌐 button
2. Click "Custom Presets" tab
3. Click "Manage Custom Presets"
4. Fill form, set keybind (e.g., press **Y**)
5. Save

### **Use a Preset:**
1. Go to tweet feed
2. **Highlight text** (e.g., "Harambe")
3. Press your keybind (e.g., **Y**)
4. ✅ Deploy form auto-fills!

---

## 🐛 TROUBLESHOOTING

**Presets not appearing?**
- Check browser console for errors
- Make sure all 3 files are in `/public/` folder
- Verify script is loading: `console.log(window.customPresetsSystem)`

**Keybinds not working?**
- Must highlight text in a tweet first
- Check keybind was saved (view preset list)
- Try different key (might conflict with browser)

**Images not generating?**
- Check browser console
- Canvas API must be supported
- Try different image type

---

## ✅ DONE!
Once integrated, commit and push to Railway!

```bash
cd railway-web
git add .
git commit -m "Add Custom Presets system with keybind support"
git push
```

Wait 2 minutes for deployment, then test! 🎉
