class ChatRoom {
    constructor() {
        this.container = document.getElementById('chat-container');
        this.messagesContainer = this.container.querySelector('.chat-messages');
        this.input = this.container.querySelector('textarea');
        this.sendButton = this.container.querySelector('.send-message');
        this.closeButton = this.container.querySelector('.close-chat');
        this.overlay = document.querySelector('.chat-overlay');
        this.typingSpeed = 3; // 打字速度 (毫秒/字)
        this.isProcessing = false; // 添加狀態標記
        this.hasShownWelcome = false; // 添加歡迎訊息標記
        
        this.initializeEventListeners();
        this.setupQuickQuestions();
    }

    initializeEventListeners() {
        // 發送訊息
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 按 Enter 發送訊息
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.isProcessing) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自動調整輸入框高度
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = this.input.scrollHeight + 'px';
        });

        // 關閉聊天室
        this.closeButton.addEventListener('click', () => {
            this.container.classList.remove('active');
            this.overlay.classList.remove('active');
        });

        // 點擊遮罩關閉聊天室
        this.overlay.addEventListener('click', () => {
            this.container.classList.remove('active');
            this.overlay.classList.remove('active');
        });
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isProcessing) return;

        // 添加用戶訊息
        this.addMessage(message, 'user');
        
        // 清空輸入框
        this.input.value = '';
        this.input.style.height = 'auto';

        // 禁用輸入
        this.isProcessing = true;
        this.disableInput();

        // 添加思考中的效果
        const thinkingMessage = document.createElement('div');
        thinkingMessage.className = 'message bot';
        thinkingMessage.innerHTML = `
            <div class="avatar">
                <img src="/static/images/ai.webp" alt="AI x SDGs">
            </div>
            <div class="message-content thinking">
                <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(thinkingMessage);
        this.scrollToBottom();

        try {
            // 發送 API 請求
            const response = await fetch('https://dmiowkdi.nutt.live/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('API 請求失敗');
            }

            const data = await response.json();
            
            // 移除思考中的效果
            thinkingMessage.remove();
            
            // 使用打字機效果顯示回應
            this.addTypingMessage(data.response, 'bot');

        } catch (error) {
            console.error('API 錯誤:', error);
            // 移除思考中的效果
            thinkingMessage.remove();
            // 顯示錯誤訊息
            this.addTypingMessage('抱歉，我現在無法回應。請稍後再試。', 'bot');
            
            // 啟用輸入
            setTimeout(() => {
                this.isProcessing = false;
                this.enableInput();
            }, 1000);
        }
    }

    // 新增打字機效果的訊息添加方法
    addTypingMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // 只有機器人訊息添加頭像和複製按鈕
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="avatar">
                    <img src="/static/images/ai.webp" alt="AI x SDGs">
                </div>
                <div class="message-content">
                    <div class="message-text"></div>
                    <div class="message-header">
                        <button class="copy-button" title="複製內容" style="display: none;">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;

            // 添加複製功能
            const copyButton = messageDiv.querySelector('.copy-button');
            copyButton.addEventListener('click', () => {
                const messageText = messageDiv.querySelector('.message-text').innerText;
                navigator.clipboard.writeText(messageText).then(() => {
                    // 顯示複製成功的視覺反饋
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.classList.add('copied');
                    
                    // 1秒後恢復原始圖示
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                        copyButton.classList.remove('copied');
                    }, 1000);
                });
            });
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text"></div>
                </div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        const messageContent = messageDiv.querySelector('.message-text');
        messageContent.style.whiteSpace = 'pre-wrap';
        
        // 將文字中的 **text** 轉換為 <strong>text</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 將文字按換行符分割成數組
        const lines = text.split('\n');
        let currentLine = 0;
        let currentChar = 0;
        let currentHtmlTag = '';  // 用於儲存當前的 HTML 標籤
        let isInHtml = false;
        
        const typeWriter = () => {
            if (currentLine < lines.length) {
                // 如果是空行，直接添加換行並進入下一行
                if (lines[currentLine] === '') {
                    messageContent.innerHTML += '<br>';
                    currentLine++;
                    setTimeout(typeWriter, this.typingSpeed);
                    return;
                }
                
                // 處理當前行的字符
                if (currentChar < lines[currentLine].length) {
                    const char = lines[currentLine][currentChar];
                    
                    // 處理 HTML 標籤
                    if (char === '<') {
                        isInHtml = true;
                        currentHtmlTag = char;
                    } else if (char === '>' && isInHtml) {
                        isInHtml = false;
                        currentHtmlTag += char;
                        messageContent.innerHTML += currentHtmlTag;
                        currentHtmlTag = '';
                    } else if (isInHtml) {
                        currentHtmlTag += char;
                    } else {
                        // 正常文字
                        messageContent.innerHTML += char;
                    }
                    
                    currentChar++;
                    this.scrollToBottom();
                    
                    // 如果在 HTML 標籤內，不需要延遲
                    if (isInHtml) {
                        typeWriter();
                    } else {
                        setTimeout(typeWriter, this.typingSpeed);
                    }
                } else {
                    // 當前行結束，添加換行
                    messageContent.innerHTML += '<br>';
                    currentLine++;
                    currentChar = 0;
                    setTimeout(typeWriter, this.typingSpeed);
                }
            } else {
                // 打字效果結束後才啟用輸入
                this.isProcessing = false;
                this.enableInput();
                // 顯示複製按鈕
                const copyButton = messageDiv.querySelector('.copy-button');
                copyButton.style.display = 'inline-block';
                this.scrollToBottom();
                this.input.focus();
            }
        };
        
        typeWriter();
    }

    // 保持原有的即時訊息添加方法（用於用戶訊息）
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // 只有機器人訊息添加頭像
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="avatar">
                    <img src="/static/images/ai.webp" alt="AI x SDGs">
                </div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    toggle() {
        this.container.classList.toggle('active');
        this.overlay.classList.toggle('active');
        
        if (this.container.classList.contains('active') && !this.hasShownWelcome) {
            this.messagesContainer.innerHTML = '';
            this.addTypingMessage('您好！\n\n歡迎使用大葉大學 SDGs AI 助理！\n\n您可以點擊下方常見問題進行快速提問，或直接輸入您的問題，我將竭誠為您解答！', 'bot');
            this.hasShownWelcome = true;
        }

        if (this.container.classList.contains('active')) {
            this.scrollToBottom();
            setTimeout(() => {
                this.input.focus();
            }, 300);
        }
    }

    // 新增禁用輸入方法
    disableInput() {
        this.input.disabled = true;
        this.sendButton.disabled = true;
        this.input.style.opacity = '0.5';
        this.sendButton.style.opacity = '0.5';
        this.input.placeholder = 'AI 助手正在回應中...';
    }

    // 修改輸入框的預設提示文字
    enableInput() {
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.style.opacity = '1';
        this.sendButton.style.opacity = '1';
        this.input.placeholder = '點此輸入您的問題...';
    }

    setupQuickQuestions() {
        // 創建快速提問容器
        const quickQuestionsContainer = document.createElement('div');
        quickQuestionsContainer.className = 'quick-questions';
        quickQuestionsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px;
            border-top: 1px solid #eee;
            background: white;
        `;

        // 添加標題
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = `
            color: var(--primary-color);
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 4px;
            padding-left: 4px;
        `;
        titleDiv.textContent = '快速提問：';
        quickQuestionsContainer.appendChild(titleDiv);

        // 創建按鈕容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        `;

        // 定義快速提問
        const questions = [
            '大葉大學的校園綠化牆有哪些特色？',
            '大葉大學的校園綠化牆如何實踐永續發展？',
            '作為一個學生，我可以如何以行動支持永續發展？'
        ];

        // 創建氣泡按鈕
        questions.forEach(question => {
            const bubble = document.createElement('button');
            bubble.className = 'question-bubble';
            bubble.textContent = question;
            bubble.style.cssText = `
                background: rgba(9, 139, 109, 0.1);
                color: var(--primary-color);
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                font-family: var(--font-body);
            `;

            // 懸浮效果
            bubble.addEventListener('mouseover', () => {
                if (!this.isProcessing) {
                    bubble.style.background = 'rgba(9, 139, 109, 0.2)';
                    bubble.style.transform = 'translateY(-2px)';
                }
            });

            bubble.addEventListener('mouseout', () => {
                if (!this.isProcessing) {
                    bubble.style.background = 'rgba(9, 139, 109, 0.1)';
                    bubble.style.transform = 'translateY(0)';
                }
            });

            // 點擊事件
            bubble.addEventListener('click', () => {
                if (!this.isProcessing) {
                    this.input.value = question;
                    this.sendMessage();
                }
            });

            // 添加處理中狀態的樣式更新
            const updateBubbleState = () => {
                if (this.isProcessing) {
                    bubble.style.opacity = '0.5';
                    bubble.style.cursor = 'not-allowed';
                    bubble.style.background = 'rgba(9, 139, 109, 0.1)';
                    bubble.style.transform = 'translateY(0)';
                } else {
                    bubble.style.opacity = '1';
                    bubble.style.cursor = 'pointer';
                }
            };

            // 監聽處理狀態變化
            const observer = new MutationObserver(() => {
                updateBubbleState();
            });

            observer.observe(this.input, {
                attributes: true,
                attributeFilter: ['disabled']
            });

            buttonsContainer.appendChild(bubble);
        });

        // 將按鈕容器添加到主容器
        quickQuestionsContainer.appendChild(buttonsContainer);

        // 將快速提問容器插入到輸入框上方
        const chatInput = this.container.querySelector('.chat-input');
        chatInput.parentNode.insertBefore(quickQuestionsContainer, chatInput);
    }
}

// 初始化聊天室
document.addEventListener('DOMContentLoaded', () => {
    const chatroom = new ChatRoom();
    
    // 綁定 AI 按鈕點擊事件
    const gptButton = document.getElementById('gpt-button');
    gptButton.addEventListener('click', () => chatroom.toggle());
}); 