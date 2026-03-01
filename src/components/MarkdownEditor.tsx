import { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Printer, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Link, ImageIcon, Quote, Code, List, ListOrdered, Minus, Table } from 'lucide-react';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`Markdown 是一种轻量级的标记语言，它允许人们使用易读易写的纯文本格式编写文档。

以下是 Markdown 最常用的语法指南，掌握这些就能满足 95% 以上的日常排版需求：

### 1. 标题 (Headings)
在文字前加上 \`#\` 和一个空格即可生成标题。\`#\` 的数量代表标题的级别（最多支持六级标题）。

\`\`\`markdown
# 是一级标题 (H1)
## 是二级标题 (H2)
### 是三级标题 (H3)
#### 是四级标题 (H4)
##### 是五级标题 (H5)
###### 是六级标题 (H6)
\`\`\`

### 2. 文本格式 (Text Formatting)
通过特定的符号将文字包围起来，实现加粗、斜体等效果。

*   **加粗**：使用双星号 \`**文字**\` ➡️ **文字**
*   *斜体*：使用单星号 \`*文字*\` ➡️ *文字*
*   ***加粗并斜体***：使用三星号 \`***文字***\` ➡️ ***文字***
*   ~~删除线~~：使用双波浪号 \`~~文字~~\` ➡️ ~~文字~~
*   <u>下划线</u>：Markdown 原生不支持下划线，可通过 HTML 标签实现 \`<u>文字</u>\` ➡️ <u>文字</u>

### 3. 列表 (Lists)
**无序列表**
使用 \`-\`、\`+\` 或 \`*\` 加上一个空格：
\`\`\`markdown
- 苹果
- 香蕉
  - 嵌套列表（前面加两个空格或按 Tab 键）
\`\`\`
*显示效果：*
* 苹果
* 香蕉
  * 嵌套列表

**有序列表**
使用数字、英文句号加一个空格：
\`\`\`markdown
1. 第一步
2. 第二步
3. 第三步
\`\`\`

### 4. 链接与图片 (Links & Images)
两者语法非常相似，图片的语法只是在最前面多了一个 \`!\`。

**链接**：\`[显示文本](链接地址)\`
\`\`\`markdown
[百度一下](https://www.baidu.com)
\`\`\`
*显示效果：* [百度一下](https://www.baidu.com)

**图片**：\`![图片替代文字](图片链接地址)\`
\`\`\`markdown
![风景图](https://picsum.photos/200/100)
\`\`\`

### 5. 引用 (Blockquotes)
在文字前加上 \`>\` 和一个空格，常用于引用别人的话或做特别标注。

\`\`\`markdown
> 这是一段引用。
>> 这是嵌套引用。
\`\`\`
*显示效果：*
> 这是一段引用。
>> 这是嵌套引用。

### 6. 代码 (Code)
**行内代码**
用反引号 \` \` \`（键盘 Esc 下方的按键，英文输入法下）将代码包起来。
\`\`\`markdown
这是一段 \`行内代码\`。
\`\`\`
*显示效果：* 这是一段 \`行内代码\`。

**代码块**
使用三个反引号 \` \`\`\` \` 将多行代码包起来，还可以在第一行反引号后面指定编程语言名称（如 python, java, javascript），以实现代码高亮。

<pre>
\`\`\`python
def hello_world():
    print("Hello, Markdown!")
\`\`\`
</pre>

### 7. 表格 (Tables)
使用 \`|\` 来分隔不同的单元格，使用 \`-\` 来分隔表头和其他行。

\`\`\`markdown
| 姓名 | 年龄 | 城市 |
| :--- | :---: | ---: |
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |
\`\`\`
*注：表头下方的横线中，冒号 \`:\` 在左边表示左对齐，在两边表示居中，在右边表示右对齐。*

*显示效果：*

| 姓名 | 年龄 | 城市 |
| :--- | :---: | ---: |
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |

### 8. 分割线 (Horizontal Rules)
在一行中用三个以上的星号 \`***\`、减号 \`---\` 或底线 \`___\` 来建立一个分隔线，行内不能有其他东西。

\`\`\`markdown
---
\`\`\`

### 9. 任务列表 (Task Lists)
常用于待办事项（To-do list）。使用 \`- [ ]\` 表示未完成，\`- [x]\` 表示已完成。（注意空格）

\`\`\`markdown
- [x] 洗衣服
- [ ] 拿快递
- [ ] 写报告
\`\`\`
*显示效果：*
- [x] 洗衣服
- [ ] 拿快递
- [ ] 写报告

---

### 💡 实用小贴士：转义字符
如果你想在文档中显示原本会被 Markdown 解析的符号（例如想打出真正的 \`#\` 或 \`*\`，而不是变成标题或粗体），可以在符号前面加上反斜杠 \`\\\`。
例如：\`\\*这不是斜体\\*\` ➡️ \\*这不是斜体\\*
`);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDownloadWord = () => {
    if (!previewRef.current) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export HTML To Doc</title>
        <style>
          @page WordSection1 {
            size: 8.5in 11.0in;
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
            mso-footer: f1;
          }
          div.WordSection1 { page: WordSection1; }
          p.MsoFooter { margin: 0in; text-align: center; font-size: 10.0pt; font-family: "Segoe UI", sans-serif; color: #64748b; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #4b5563; }
          h1, h2, h3, h4, h5, h6 { color: #334155; margin-top: 1.5em; margin-bottom: 0.5em; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background-color: #f8fafc; color: #334155; }
          blockquote { border-left: 4px solid #cbd5e1; margin: 1.5em 10px; padding: 0.5em 10px; color: #64748b; background-color: #f8fafc; }
          code { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; background-color: #f1f5f9; padding: 2px 4px; border-radius: 3px; color: #475569; }
          pre { background-color: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 5px; overflow-x: auto; }
          pre code { background-color: transparent; color: inherit; padding: 0; }
          img { max-width: 100%; height: auto; }
          a { color: #4f46e5; text-decoration: none; }
          a:hover { text-decoration: underline; }
          ul, ol { margin-bottom: 1em; }
          li { margin-bottom: 0.25em; }
        </style>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
      </head>
      <body>
        <div class="WordSection1">
          ${previewRef.current.innerHTML}
          
          <div style="mso-element:footer" id="f1">
            <p class="MsoFooter" align="center" style="text-align:center">
              Page <span style="mso-field-code:' PAGE '"></span> / <span style="mso-field-code:' NUMPAGES '"></span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.doc';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const handleInsertTable = () => {
    let tableMarkdown = '\n';
    
    // Header row
    tableMarkdown += '|';
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += ` Column ${i + 1} |`;
    }
    tableMarkdown += '\n';
    
    // Separator row
    tableMarkdown += '|';
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += ' -------- |';
    }
    tableMarkdown += '\n';
    
    // Data rows
    for (let r = 0; r < tableRows; r++) {
      tableMarkdown += '|';
      for (let c = 0; c < tableCols; c++) {
        tableMarkdown += ' Text     |';
      }
      tableMarkdown += '\n';
    }
    
    insertText(tableMarkdown, '');
    setShowTableModal(false);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, label }: any) => (
    <button 
      onClick={onClick} 
      title={title}
      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
    >
      <Icon size={18} />
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-full w-full print:block print:h-auto print:overflow-visible">
      <div className="w-1/2 h-full border-r border-slate-200 flex flex-col print:hidden bg-white">
        <div className="min-h-[56px] py-2 px-4 border-b border-slate-200 bg-slate-50 flex items-center gap-1 flex-wrap shrink-0">
          <ToolbarButton icon={Bold} title="Bold" label="Bold" onClick={() => insertText('**', '**')} />
          <ToolbarButton icon={Italic} title="Italic" label="Italic" onClick={() => insertText('*', '*')} />
          <ToolbarButton icon={Strikethrough} title="Strikethrough" onClick={() => insertText('~~', '~~')} />
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          <ToolbarButton icon={Heading1} title="Heading 1 (H1)" onClick={() => insertText('# ', '')} />
          <ToolbarButton icon={Heading2} title="Heading 2 (H2)" onClick={() => insertText('## ', '')} />
          <ToolbarButton icon={Heading3} title="Heading 3 (H3)" onClick={() => insertText('### ', '')} />
          <ToolbarButton icon={Heading4} title="Heading 4 (H4)" onClick={() => insertText('#### ', '')} />
          <ToolbarButton icon={Heading5} title="Heading 5 (H5)" onClick={() => insertText('##### ', '')} />
          <ToolbarButton icon={Heading6} title="Heading 6 (H6)" onClick={() => insertText('###### ', '')} />
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          <ToolbarButton icon={Quote} title="Quote" onClick={() => insertText('> ', '')} />
          <ToolbarButton icon={Code} title="Code" onClick={() => insertText('`', '`')} />
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          <ToolbarButton icon={List} title="Bullet List" onClick={() => insertText('- ', '')} />
          <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => insertText('1. ', '')} />
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          <ToolbarButton icon={Minus} title="Horizontal Rule" onClick={() => insertText('\n---\n', '')} />
          <ToolbarButton icon={Table} title="Table" onClick={() => setShowTableModal(true)} />
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          <ToolbarButton icon={Link} title="Link" onClick={() => insertText('[', '](url)')} />
          <ToolbarButton icon={ImageIcon} title="Image" onClick={() => insertText('![alt text](', ')')} />
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm text-slate-800 bg-white"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Type your markdown here..."
        />
      </div>
      <div className="w-1/2 h-full flex flex-col bg-white print:w-full print:h-auto print:block relative">
        <style>
          {`
            @media print {
              @page {
                margin: 20mm;
              }
            }
          `}
        </style>
        <div className="min-h-[56px] py-2 px-4 border-b border-slate-200 flex justify-end items-center bg-slate-50 print:hidden shrink-0">
          <div className="flex gap-2">
            <button onClick={handleDownloadWord} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
              <Download size={16} /> Word
            </button>
            <button onClick={handlePrintPdf} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
              <Printer size={16} /> PDF
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8 print:overflow-visible print:p-0">
          <div ref={previewRef} className="prose prose-slate prose-headings:text-slate-700 prose-p:text-slate-600 prose-strong:text-slate-800 prose-strong:font-bold prose-em:text-slate-700 prose-em:italic prose-a:text-indigo-600 prose-li:text-slate-600 prose-blockquote:text-slate-500 prose-blockquote:border-slate-300 prose-pre:bg-slate-50 prose-pre:text-slate-700 prose-pre:border prose-pre:border-slate-200 prose-code:text-slate-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-hr:border-slate-200 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:p-2 prose-th:text-slate-700 prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-td:text-slate-600 max-w-none print:max-w-full text-slate-600">
            <Markdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={prism}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ backgroundColor: 'transparent', padding: 0, margin: 0, border: 'none' }}
                    />
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {markdown}
            </Markdown>
          </div>
        </div>
      </div>
      
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Insert Table</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rows</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={tableRows} 
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Columns</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={tableCols} 
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleInsertTable}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
