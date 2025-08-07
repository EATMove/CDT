// HTML元素测试内容
export const HTML_TEST_CONTENT = `
<div class="bg-white p-6 rounded-lg shadow-sm border">
  <h1 class="text-3xl font-bold text-gray-900 mb-6">HTML元素测试页面</h1>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4">1. 标题元素</h2>
  <h1>一级标题 (h1)</h1>
  <h2>二级标题 (h2)</h2>
  <h3>三级标题 (h3)</h3>
  <h4>四级标题 (h4)</h4>
  <h5>五级标题 (h5)</h5>
  <h6>六级标题 (h6)</h6>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">2. 段落和文本格式</h2>
  <p>这是一个普通的段落。包含 <strong>粗体文本</strong>、<em>斜体文本</em>、<u>下划线文本</u>、<del>删除线文本</del>、<mark>标记文本</mark>、<small>小字体文本</small>。</p>
  
  <p>还包含 <sup>上标</sup> 和 <sub>下标</sub> 文本。</p>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">3. 列表元素</h2>
  
  <h3 class="text-xl font-medium text-gray-700 mb-3">无序列表</h3>
  <ul>
    <li>第一个列表项</li>
    <li>第二个列表项</li>
    <li>第三个列表项
      <ul>
        <li>嵌套列表项 1</li>
        <li>嵌套列表项 2</li>
      </ul>
    </li>
  </ul>
  
  <h3 class="text-xl font-medium text-gray-700 mb-3">有序列表</h3>
  <ol>
    <li>第一个有序列表项</li>
    <li>第二个有序列表项</li>
    <li>第三个有序列表项
      <ol>
        <li>嵌套有序列表项 1</li>
        <li>嵌套有序列表项 2</li>
      </ol>
    </li>
  </ol>
  
  <h3 class="text-xl font-medium text-gray-700 mb-3">定义列表</h3>
  <dl>
    <dt>HTML</dt>
    <dd>超文本标记语言，用于创建网页的标准标记语言。</dd>
    <dt>CSS</dt>
    <dd>层叠样式表，用于描述HTML文档的样式。</dd>
    <dt>JavaScript</dt>
    <dd>一种编程语言，用于为网页添加交互功能。</dd>
  </dl>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">4. 链接和引用</h2>
  <p>这是一个 <a href="#" class="text-blue-600 hover:text-blue-800 underline">链接示例</a>。</p>
  
  <blockquote class="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic">
    这是一个引用块。引用内容通常用于突出显示重要的文本。
    <cite class="block text-sm text-gray-600 mt-2">— 引用来源</cite>
  </blockquote>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">5. 代码元素</h2>
  <p>行内代码：<code>console.log('Hello World')</code></p>
  
  <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));</code></pre>
  
  <p>键盘输入：按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制</p>
  <p>变量：<var>x</var> = <var>y</var> + <var>z</var></p>
  <p>样本输出：<samp>Hello World</samp></p>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">6. 表格</h2>
  <table class="w-full border-collapse border border-gray-300">
    <thead>
      <tr class="bg-gray-100">
        <th class="border border-gray-300 px-4 py-2 text-left">姓名</th>
        <th class="border border-gray-300 px-4 py-2 text-left">年龄</th>
        <th class="border border-gray-300 px-4 py-2 text-left">职业</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-gray-300 px-4 py-2">张三</td>
        <td class="border border-gray-300 px-4 py-2">25</td>
        <td class="border border-gray-300 px-4 py-2">工程师</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="border border-gray-300 px-4 py-2">李四</td>
        <td class="border border-gray-300 px-4 py-2">30</td>
        <td class="border border-gray-300 px-4 py-2">设计师</td>
      </tr>
      <tr>
        <td class="border border-gray-300 px-4 py-2">王五</td>
        <td class="border border-gray-300 px-4 py-2">28</td>
        <td class="border border-gray-300 px-4 py-2">产品经理</td>
      </tr>
    </tbody>
  </table>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">7. 表单元素</h2>
  <form class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">进度条：</label>
      <progress value="75" max="100" class="w-full"></progress>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">计量器：</label>
      <meter value="0.8" min="0" max="1" low="0.3" high="0.7" optimum="0.5" class="w-full"></meter>
    </div>
  </form>
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">8. 其他元素</h2>
  <p>时间：<time datetime="2024-12-01">2024年12月1日</time></p>
  <p>数据：<data value="123">一百二十三</data></p>
  <p>输出：<output>计算结果</output></p>
  
  <address class="text-gray-600 italic mt-4">
    联系地址：北京市朝阳区某某街道123号<br>
    邮箱：example@email.com<br>
    电话：+86 123 4567 8900
  </address>
  
  <hr class="my-8 border-gray-300">
  
  <h2 class="text-2xl font-semibold text-gray-800 mb-4">9. Tailwind CSS 样式测试</h2>
  
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-4">
    <h3 class="text-xl font-semibold mb-2">渐变背景卡片</h3>
    <p>这是一个使用Tailwind CSS渐变背景的卡片。</p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div class="bg-green-100 border border-green-300 p-4 rounded-lg">
      <h4 class="text-green-800 font-semibold mb-2">成功卡片</h4>
      <p class="text-green-700">操作成功完成！</p>
    </div>
    <div class="bg-red-100 border border-red-300 p-4 rounded-lg">
      <h4 class="text-red-800 font-semibold mb-2">错误卡片</h4>
      <p class="text-red-700">出现了一个错误。</p>
    </div>
  </div>
  
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">标签1</span>
    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">标签2</span>
    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">标签3</span>
    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">标签4</span>
  </div>
  
  <div class="bg-gray-50 p-4 rounded-lg">
    <h4 class="font-semibold mb-2">响应式设计测试</h4>
    <p class="text-sm text-gray-600">这个页面在不同设备上应该有不同的显示效果。</p>
    <div class="mt-2 text-xs text-gray-500">
      <p>移动端：字体较小，间距紧凑</p>
      <p>平板：中等字体，适中间距</p>
      <p>桌面端：较大字体，宽松间距</p>
    </div>
  </div>
</div>
`;

// 简单的HTML元素测试
export const SIMPLE_HTML_TEST = `
<h1>HTML元素测试</h1>

<h2>列表测试</h2>
<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
  <li>无序列表项 3</li>
</ul>

<ol>
  <li>有序列表项 1</li>
  <li>有序列表项 2</li>
  <li>有序列表项 3</li>
</ol>

<h2>文本格式测试</h2>
<p>这是<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>、<del>删除线</del>文本。</p>

<h2>表格测试</h2>
<table border="1">
  <tr>
    <th>标题1</th>
    <th>标题2</th>
  </tr>
  <tr>
    <td>内容1</td>
    <td>内容2</td>
  </tr>
</table>
`;
