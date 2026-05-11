# Excel 表格识别技巧

**更新时间：** 2026-04-28

## 读取 Excel 的库

### openpyxl（推荐）
用于读取单元格颜色、合并单元格等详细信息。

```python
from openpyxl import load_workbook

wb = load_workbook('file.xlsx')
ws = wb['SheetName']
```

### pandas
用于快速读取表格数据，但无法处理合并单元格和颜色。

```python
import pandas as pd
df = pd.read_excel('file.xlsx', sheet_name='SheetName')
```

---

## 识别合并单元格

```python
from openpyxl import load_workbook

wb = load_workbook('file.xlsx')
ws = wb['SheetName']

# 获取所有合并单元格区域
merged = ws.merged_cells.ranges
for m in merged:
    value = ws.cell(m.min_row, m.min_col).value
    print(f"合并区域: {m}, 值: {value}")
```

---

## 识别单元格颜色

### RGB 颜色格式
`FFRRGGBB`（前两位是透明度）

### 课程表颜色含义

| RGB 值 | 颜色 | 含义 |
|--------|------|------|
| `FF00B050` | 🟢 绿色 | 自己的课 |
| `FF00B0F0` | 🔵 蓝色 | 长期代课 |
| `FFFFFF00` | 🟡 黄色 | 短期代课 |
| `00000000` | ⚪ 透明/无色 | 无特殊标记 |

### 代码示例

```python
from openpyxl import load_workbook

wb = load_workbook('file.xlsx')
ws = wb['SheetName']

# 遍历所有单元格
for row in range(1, max_row + 1):
    for col in range(1, max_col + 1):
        cell = ws.cell(row, col)
        fill = cell.fill
        
        if fill and fill.fgColor:
            color = fill.fgColor
            if color.type == 'rgb':
                rgb = color.rgb  # 如 'FF00B050'
                
                # 解析颜色含义
                if rgb == 'FF00B050':
                    color_name = "绿色-自己课"
                elif rgb == 'FF00B0F0':
                    color_name = "蓝色-长期代课"
                elif rgb == 'FFFFFF00':
                    color_name = "黄色-短期代课"
                else:
                    color_name = "无/其他"
                
                print(f"行{row}列{col}: {cell.value} -> {color_name}")
```

---

## 完整读取课程表示例

```python
from openpyxl import load_workbook

def read_schedule():
    file_path = "/Users/a123456/Documents/课程表.xlsx"
    wb = load_workbook(file_path)
    ws = wb['第一周']
    
    # 颜色映射
    color_map = {
        'FF00B050': '🟢 自己课',
        'FF00B0F0': '🔵 长期代课',
        'FFFFFF00': '🟡 短期代课',
    }
    
    # 读取数据（考虑合并单元格）
    schedule = {}
    
    for row in range(3, 15):  # 数据从第3行开始
        for col in range(4, 9):  # 周一到周五（D-H列）
            cell = ws.cell(row, col)
            value = cell.value
            
            if value:  # 如果有值（可能是合并单元格的主单元格）
                time = ws.cell(row, 2).value  # B列是时间
                day_map = {4: '周一', 5: '周二', 6: '周三', 7: '周四', 8: '周五'}
                day = day_map.get(col, '')
                
                # 获取颜色
                color = '无'
                if cell.fill and cell.fill.fgColor and cell.fill.fgColor.type == 'rgb':
                    rgb = cell.fill.fgColor.rgb
                    color = color_map.get(rgb, '其他')
                
                schedule[f"{day}_{time}"] = {'课': value, '类型': color}
    
    wb.close()
    return schedule
```

---

## 注意事项

1. **pandas 读不到合并单元格** — 必须用 openpyxl
2. **颜色 RGB 前两位是透明度** — `FF` 表示完全不透明
3. **代课颜色说明**：
   - 🟢 绿色 = 自己课
   - 🔵 蓝色 = 长期代课
   - 🟡 黄色 = 短期代课
   - 六教 = 六号教学楼，后面数字是房间号

---

## 相关文件

- 课程表位置：`~/Documents/课程表.xlsx`
- 代课说明：`Obsidian Vault/脑/日程管理/代课日程.md`
