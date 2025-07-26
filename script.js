document.addEventListener('DOMContentLoaded', function() {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const sloganInput = document.getElementById('slogan');
    const qrcodeInput = document.getElementById('qrcode');
    const bgColorInput = document.getElementById('bgColor');
    const bgImageInput = document.getElementById('bgImage');
    const bgOpacityInput = document.getElementById('bgOpacity');
    const bgOpacityValue = document.getElementById('bgOpacityValue');
    const clearBgBtn = document.getElementById('clearBg');
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    // 文字样式控制元素
    const titleColorInput = document.getElementById('titleColor');
    const titleFontSelect = document.getElementById('titleFont');
    const titleSizeInput = document.getElementById('titleSize');
    const contentColorInput = document.getElementById('contentColor');
    const contentFontSelect = document.getElementById('contentFont');
    const contentSizeInput = document.getElementById('contentSize');
    const sloganColorInput = document.getElementById('sloganColor');
    const sloganFontSelect = document.getElementById('sloganFont');
    const sloganSizeInput = document.getElementById('sloganSize');
    
    const previewTitle = document.getElementById('previewTitle');
    const previewContent = document.getElementById('previewContent');
    const previewSlogan = document.getElementById('previewSlogan');
    const previewQr = document.getElementById('previewQr');
    const qrPreview = document.getElementById('qrPreview');
    const qrOptions = document.getElementById('qrOptions');
    const card = document.getElementById('card');
    
    // 裁剪相关元素
    const cropModal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    const manualCropBtn = document.getElementById('manualCropBtn');
    const useOriginalBtn = document.getElementById('useOriginalBtn');
    const confirmCropBtn = document.getElementById('confirmCrop');
    const cancelCropBtn = document.getElementById('cancelCrop');
    const closeCropBtn = document.getElementById('closeCrop');
    
    let cropper = null;
    let originalImageData = null;
    let isDragging = false;
    let currentDragElement = null;
    let dragOffset = { x: 0, y: 0 };
    
    // 基础文字输入监听
    titleInput.addEventListener('input', function() {
        previewTitle.textContent = this.value || '卡片标题';
    });
    
    contentInput.addEventListener('input', function() {
        previewContent.textContent = this.value || '这里是卡片的正文内容，支持多行文字显示。';
    });
    
    sloganInput.addEventListener('input', function() {
        previewSlogan.textContent = this.value || '标语文字';
    });
    
    // 背景透明度控制
    bgOpacityInput.addEventListener('input', function() {
        const opacity = this.value / 100;
        bgOpacityValue.textContent = `${this.value}%`;
        const overlay = card.querySelector('::before') || card;
        card.style.setProperty('--bg-opacity', opacity);
        
        // 更新伪元素透明度
        const style = document.createElement('style');
        style.textContent = `
            .card::before {
                background: rgba(255, 255, 255, ${opacity}) !important;
            }
        `;
        document.head.appendChild(style);
    });
    
    // 文字样式控制
    function updateTextStyle(element, colorInput, fontSelect, sizeInput) {
        const color = colorInput.value;
        const font = fontSelect.value;
        const size = sizeInput.value + 'px';
        
        element.style.color = color;
        element.style.fontFamily = font;
        element.style.fontSize = size;
    }
    
    titleColorInput.addEventListener('input', () => updateTextStyle(previewTitle, titleColorInput, titleFontSelect, titleSizeInput));
    titleFontSelect.addEventListener('change', () => updateTextStyle(previewTitle, titleColorInput, titleFontSelect, titleSizeInput));
    titleSizeInput.addEventListener('input', () => updateTextStyle(previewTitle, titleColorInput, titleFontSelect, titleSizeInput));
    
    contentColorInput.addEventListener('input', () => updateTextStyle(previewContent, contentColorInput, contentFontSelect, contentSizeInput));
    contentFontSelect.addEventListener('change', () => updateTextStyle(previewContent, contentColorInput, contentFontSelect, contentSizeInput));
    contentSizeInput.addEventListener('input', () => updateTextStyle(previewContent, contentColorInput, contentFontSelect, contentSizeInput));
    
    sloganColorInput.addEventListener('input', () => updateTextStyle(previewSlogan, sloganColorInput, sloganFontSelect, sloganSizeInput));
    sloganFontSelect.addEventListener('change', () => updateTextStyle(previewSlogan, sloganColorInput, sloganFontSelect, sloganSizeInput));
    sloganSizeInput.addEventListener('input', () => updateTextStyle(previewSlogan, sloganColorInput, sloganFontSelect, sloganSizeInput));
    
    qrcodeInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImageData = e.target.result;
                
                const img = document.createElement('img');
                img.src = originalImageData;
                img.alt = '二维码预览';
                
                qrPreview.innerHTML = '';
                qrPreview.appendChild(img);
                qrOptions.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    manualCropBtn.addEventListener('click', function() {
        if (originalImageData) {
            cropImage.src = originalImageData;
            cropModal.style.display = 'block';
            
            setTimeout(() => {
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true,
                    background: false
                });
            }, 100);
        }
    });
    
    useOriginalBtn.addEventListener('click', function() {
        if (originalImageData) {
            const img = document.createElement('img');
            img.src = originalImageData;
            img.alt = '二维码';
            
            previewQr.innerHTML = '';
            previewQr.appendChild(img);
        }
    });
    
    confirmCropBtn.addEventListener('click', function() {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            
            const croppedDataUrl = canvas.toDataURL('image/png', 1.0);
            
            const img = document.createElement('img');
            img.src = croppedDataUrl;
            img.alt = '裁剪后的二维码';
            
            previewQr.innerHTML = '';
            previewQr.appendChild(img);
            
            closeCropModal();
        }
    });
    
    function closeCropModal() {
        cropModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }
    
    cancelCropBtn.addEventListener('click', closeCropModal);
    closeCropBtn.addEventListener('click', closeCropModal);
    
    cropModal.addEventListener('click', function(e) {
        if (e.target === cropModal) {
            closeCropModal();
        }
    });
    
    bgColorInput.addEventListener('change', function() {
        if (!card.style.backgroundImage || card.style.backgroundImage === 'none') {
            card.style.backgroundColor = this.value;
        }
    });
    
    bgImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                card.style.backgroundImage = `url(${e.target.result})`;
                card.style.backgroundColor = '';
                bgColorInput.disabled = true;
            };
            reader.readAsDataURL(file);
        }
    });
    
    clearBgBtn.addEventListener('click', function() {
        card.style.backgroundColor = '#ffffff';
        card.style.backgroundImage = '';
        bgColorInput.value = '#ffffff';
        bgImageInput.value = '';
        bgColorInput.disabled = false;
    });
    
    // 处理圆角透明化的共用函数
    function processRoundedCorners(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 计算圆角半径（根据scale调整）
        const radius = 16 * 2; // scale = 2
        const width = canvas.width;
        const height = canvas.height;
        
        // 处理四个角的透明化
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // 检查是否在圆角外
                let inCorner = false;
                
                // 左上角
                if (x < radius && y < radius) {
                    const dx = radius - x;
                    const dy = radius - y;
                    if (dx * dx + dy * dy > radius * radius) {
                        inCorner = true;
                    }
                }
                // 右上角
                else if (x > width - radius && y < radius) {
                    const dx = x - (width - radius);
                    const dy = radius - y;
                    if (dx * dx + dy * dy > radius * radius) {
                        inCorner = true;
                    }
                }
                // 左下角
                else if (x < radius && y > height - radius) {
                    const dx = radius - x;
                    const dy = y - (height - radius);
                    if (dx * dx + dy * dy > radius * radius) {
                        inCorner = true;
                    }
                }
                // 右下角
                else if (x > width - radius && y > height - radius) {
                    const dx = x - (width - radius);
                    const dy = y - (height - radius);
                    if (dx * dx + dy * dy > radius * radius) {
                        inCorner = true;
                    }
                }
                
                // 如果在圆角外，设置为透明
                if (inCorner) {
                    data[index + 3] = 0; // 设置alpha为0（透明）
                }
            }
        }
        
        // 将处理后的图像数据放回canvas
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
    
    exportBtn.addEventListener('click', function() {
        this.textContent = '生成中...';
        this.disabled = true;
        
        // 临时移除卡片阴影
        const originalBoxShadow = card.style.boxShadow;
        card.style.boxShadow = 'none';
        
        html2canvas(card, {
            scale: 2,
            backgroundColor: null,
            logging: false,
            useCORS: true
        }).then(canvas => {
            // 恢复阴影
            card.style.boxShadow = originalBoxShadow;
            
            // 处理圆角透明
            processRoundedCorners(canvas);
            
            const link = document.createElement('a');
            link.download = `知识卡片_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            exportBtn.textContent = '导出卡片';
            exportBtn.disabled = false;
        }).catch(error => {
            // 恢复阴影
            card.style.boxShadow = originalBoxShadow;
            
            console.error('导出失败:', error);
            alert('导出失败，请重试');
            exportBtn.textContent = '导出卡片';
            exportBtn.disabled = false;
        });
    });
    
    // 复制卡片到剪贴板功能（直角版本）
    copyBtn.addEventListener('click', function() {
        // 检查浏览器支持
        if (!navigator.clipboard || !navigator.clipboard.write) {
            alert('当前浏览器不支持复制功能，请使用下载功能或在HTTPS环境下使用');
            return;
        }
        
        this.textContent = '复制中...';
        this.disabled = true;
        
        // 临时移除卡片样式：阴影和圆角
        const originalBoxShadow = card.style.boxShadow;
        const originalBorderRadius = card.style.borderRadius;
        
        card.style.boxShadow = 'none';
        card.style.borderRadius = '0px';
        
        html2canvas(card, {
            scale: 2,
            backgroundColor: null,
            allowTaint: true,
            useCORS: true,
            logging: false
        }).then(canvas => {
            // 恢复原样式
            card.style.boxShadow = originalBoxShadow;
            card.style.borderRadius = originalBorderRadius;
            
            canvas.toBlob(blob => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    copyBtn.textContent = '复制成功！';
                    setTimeout(() => {
                        copyBtn.textContent = '复制卡片';
                        copyBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请重试或尝试下载功能。\n提示：Safari需要在HTTPS环境下才能正常复制');
                    copyBtn.textContent = '复制卡片';
                    copyBtn.disabled = false;
                });
            }, 'image/png', 1.0);
        }).catch(error => {
            // 恢复原样式
            card.style.boxShadow = originalBoxShadow;
            card.style.borderRadius = originalBorderRadius;
            
            console.error('生成图片失败:', error);
            alert('生成图片失败，请重试');
            copyBtn.textContent = '复制卡片';
            copyBtn.disabled = false;
        });
    });
    
    // 拖拽功能
    function initDragFeature() {
        const draggableElements = document.querySelectorAll('.draggable-text');
        
        draggableElements.forEach(element => {
            element.addEventListener('mousedown', handleMouseDown);
        });
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    function handleMouseDown(e) {
        if (e.target.classList.contains('draggable-text')) {
            isDragging = true;
            currentDragElement = e.target;
            currentDragElement.classList.add('dragging');
            
            const rect = currentDragElement.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            e.preventDefault();
        }
    }
    
    function handleMouseMove(e) {
        if (isDragging && currentDragElement) {
            const cardRect = card.getBoundingClientRect();
            
            let newX = e.clientX - cardRect.left - dragOffset.x;
            let newY = e.clientY - cardRect.top - dragOffset.y;
            
            // 边界限制
            const maxX = card.offsetWidth - currentDragElement.offsetWidth;
            const maxY = card.offsetHeight - currentDragElement.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            currentDragElement.style.left = newX + 'px';
            currentDragElement.style.top = newY + 'px';
            currentDragElement.style.right = 'auto';
            currentDragElement.style.bottom = 'auto';
        }
    }
    
    function handleMouseUp() {
        if (isDragging && currentDragElement) {
            currentDragElement.classList.remove('dragging');
            isDragging = false;
            currentDragElement = null;
        }
    }
    
    // 初始化拖拽功能
    initDragFeature();
    
    function adjustCardContent() {
        const cardHeight = card.offsetHeight;
        const contentHeight = previewContent.scrollHeight;
        
        if (contentHeight > cardHeight * 0.6) {
            previewContent.style.fontSize = '14px';
        } else {
            previewContent.style.fontSize = '16px';
        }
    }
    
    contentInput.addEventListener('input', adjustCardContent);
    window.addEventListener('resize', adjustCardContent);
    
    // 初始化界面
    previewQr.innerHTML = '<div style="color: #999; font-size: 10px;">二维码</div>';
    
    // 初始化文字样式
    updateTextStyle(previewTitle, titleColorInput, titleFontSelect, titleSizeInput);
    updateTextStyle(previewContent, contentColorInput, contentFontSelect, contentSizeInput);
    updateTextStyle(previewSlogan, sloganColorInput, sloganFontSelect, sloganSizeInput);
});