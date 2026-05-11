Gram-Schmidt正交化是将一组线性无关的向量转化为两两正交向量组的过程，同时保持它们张成的空间不变。
### 算法步骤

给定向量组 $\{\alpha_1, \alpha_2, \ldots, \alpha_n\}$，求正交向量组 $\{\beta_1, \beta_2, \ldots, \beta_n\}$$：

**第一步：**
$$\beta_1 = \alpha_1$$

**第二步：**
$$\beta_2 = \alpha_2 - \frac{(\alpha_2, \beta_1)}{(\beta_1, \beta_1)}\beta_1$$

**第k步：**
$$\beta_k = \alpha_k - \sum_{j=1}^{k-1}\frac{(\alpha_k, \beta_j)}{(\beta_j, \beta_j)}\beta_j$$

其中 $(\cdot, \cdot)$ 表示内积（点乘）。

解释：通过让$\beta_k$减去$\beta_k$在$\beta_{k-1},\dots,\beta_1$平行方向上的分量，$使得\beta_k$与$\beta_{k-1},\dots,\beta_1$垂直。重复此过程
### 直观理解

| 步骤  | 操作                                   | 几何意义                       |
| :-- | :----------------------------------- | :------------------------- |
| 1   | 取 $\beta_1 = \alpha_1$               | 保留第一个方向                    |
| 2   | 从 $\alpha_2$ 中减去在 $\beta_1$ 上的投影     | 消除与 $\beta_1$ 平行的分量，得到垂直分量 |
| k   | 从 $\alpha_k$ 中减去在之前所有 $\beta_j$ 上的投影 | 确保与之前所有向量正交                |

### 单位化（得到标准正交基）

若需要**标准正交基**，则将每个 $\beta_i$ 单位化：
$$\varepsilon_i = \frac{\beta_i}{\|\beta_i\|}$$

### 重要性质

1. **等价性**：$\text{span}\{\alpha_1,\ldots,\alpha_n\} = \text{span}\{\beta_1,\ldots,\beta_n\}$
2. **正交性**：$(\beta_i, \beta_j) = 0$（当 $i \neq j$）
3. **唯一性**：若要求 $\|\beta_i\| = 1$，则结果唯一（符号除外）

