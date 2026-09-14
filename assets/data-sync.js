/**
 * data-sync.js - 数据同步和本地加载功能
 * 用于动态加载笔记和设计资源的结构
 */

class DataSync {
    constructor() {
        this.data = null;
        this.loaded = false;
    }

    /**
     * 加载数据结构
     * @returns {Promise} 返回数据对象
     */
    async loadStructure() {
        try {
            const response = await fetch('data/structure.json');
            if (!response.ok) {
                throw new Error('Failed to load structure data');
            }
            this.data = await response.json();
            this.loaded = true;
            return this.data;
        } catch (error) {
            console.error('Error loading structure:', error);
            // 返回默认结构
            return this.getDefaultStructure();
        }
    }

    /**
     * 获取默认结构（当加载失败时使用）
     * @returns {Object} 默认数据结构
     */
    getDefaultStructure() {
        return {
            notes: {
                "第一章": {
                    title: "第一章 · HTML",
                    items: [
                        { file: "语义化.html", title: "语义化" }
                    ]
                }
            },
            designResources: {
                "设计规范": {
                    title: "设计规范",
                    items: [
                        { file: "设计规范-温暖大地色系.html", title: "设计规范 · 温暖大地色系" }
                    ]
                }
            }
        };
    }

    /**
     * 获取笔记列表
     * @returns {Object} 笔记结构
     */
    getNotes() {
        return this.data?.notes || {};
    }

    /**
     * 获取设计资源列表
     * @returns {Object} 设计资源结构
     */
    getDesignResources() {
        return this.data?.designResources || {};
    }

    /**
     * 生成笔记树形HTML
     * @param {string} basePath 基础路径
     * @returns {string} HTML字符串
     */
    generateNotesTreeHTML(basePath = '笔记') {
        const notes = this.getNotes();
        let html = '<div class="tree-container">';
        
        for (const [chapter, data] of Object.entries(notes)) {
            html += `
                <div class="tree-chapter">
                    <div class="tree-chapter-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <span class="tree-toggle">▶</span>
                        <span class="tree-chapter-title">${data.title}</span>
                        <span class="tree-count">${data.items.length} 篇</span>
                    </div>
                    <div class="tree-items">
                        ${data.items.map(item => `
                            <a href="${basePath}/${chapter}/${item.file}" class="tree-item" target="_blank">
                                <span class="tree-item-icon">📄</span>
                                <span class="tree-item-title">${item.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 生成设计资源树形HTML
     * @param {string} basePath 基础路径
     * @returns {string} HTML字符串
     */
    generateDesignResourcesTreeHTML(basePath = '设计资源') {
        const resources = this.getDesignResources();
        let html = '<div class="tree-container">';
        
        for (const [category, data] of Object.entries(resources)) {
            html += `
                <div class="tree-chapter">
                    <div class="tree-chapter-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <span class="tree-toggle">▶</span>
                        <span class="tree-chapter-title">${data.title}</span>
                        <span class="tree-count">${data.items.length} 个</span>
                    </div>
                    <div class="tree-items">
                        ${data.items.map(item => `
                            <a href="${basePath}/${item.file}" class="tree-item" target="_blank">
                                <span class="tree-item-icon">🎨</span>
                                <span class="tree-item-title">${item.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 刷新数据（重新扫描目录）
     * 注意：在纯前端环境中，这需要服务器端支持
     * 这里只是重新加载JSON文件
     */
    async refresh() {
        this.loaded = false;
        this.data = null;
        return await this.loadStructure();
    }
}

// 创建全局实例
window.dataSync = new DataSync();
