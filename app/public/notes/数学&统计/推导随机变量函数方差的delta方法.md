
## 一、核心理论基础

### 1. 大数定律（Law of Large Numbers）

$$\hat{p} = \frac{m}{n} \xrightarrow{p} p \quad \text{当 } n \to \infty$$

**意义**：样本频率依概率收敛到真实概率，为泰勒展开提供"展开点"。

---

### 2. [中心极限定理](中心极限定理.md)（Central Limit Theorem）

$$\sqrt{n}(\hat{p} - p) \xrightarrow{d} N(0, p(1-p))$$

**意义**：$\hat{p}$ 的抽样分布渐近正态，使得线性近似后的分布也是正态。

---

### 3. 连续映射定理（Continuous Mapping Theorem）

若 $X_n \xrightarrow{p} c$，且 $g$ 在 $c$ 处连续，则：
$$g(X_n) \xrightarrow{p} g(c)$$

**意义**：保证非线性变换后的估计量也收敛。

---

## 二、Delta方法的严格推导

### 定理陈述

设 $\sqrt{n}(\hat{\theta} - \theta) \xrightarrow{d} N(0, \sigma^2)$，$g(\cdot)$ 在 $\theta$ 处可导且 $g'(\theta) \neq 0$，则：

$$\sqrt{n}\left[g(\hat{\theta}) - g(\theta)\right] \xrightarrow{d} N\left(0, \left[g'(\theta)\right]^2 \sigma^2\right)$$

### 证明步骤

**第一步：泰勒展开（带余项）**

$$g(\hat{\theta}) = g(\theta) + g'(\theta)(\hat{\theta}-\theta) + \frac{g''(\xi)}{2}(\hat{\theta}-\theta)^2$$

其中 $\xi$ 在 $\hat{\theta}$ 与 $\theta$ 之间。

**第二步：整理**

$$\sqrt{n}\left[g(\hat{\theta})-g(\theta)\right] = g'(\theta)\cdot\sqrt{n}(\hat{\theta}-\theta) + \sqrt{n}\cdot\frac{g''(\xi)}{2}(\hat{\theta}-\theta)^2$$
**第三步：分析主项**
由中心极限定理：
$$\sqrt{n}(\hat{\theta} - \theta) \xrightarrow{d} N(0, \sigma^2)$$

因此：
$$g'(\theta) \cdot \sqrt{n}(\hat{\theta} - \theta) \xrightarrow{d} g'(\theta) \cdot N(0, \sigma^2)$$

**第四步：正态分布的线性变换**
对于正态分布，若 $Z \sim N(0, \sigma^2)$，则：
$$a \cdot Z \sim N(0, a^2\sigma^2)$$

应用到主项：
$$g'(\theta) \cdot N(0, \sigma^2) = N\left(0, [g'(\theta)]^2\sigma^2\right)$$
**第五步：分析余项**
由于 $\hat{\theta} \xrightarrow{p} \theta$，所以 $\xi \xrightarrow{p} \theta$，且：
- $\sqrt{n}(\hat{\theta}-\theta) = O_p(1)$（依分布有界）
- $(\hat{\theta}-\theta) = o_p(1)$（依概率收敛到0）

因此余项：
$$\sqrt{n}\cdot(\hat{\theta}-\theta)^2 = \frac{1}{\sqrt{n}}\cdot[\sqrt{n}(\hat{\theta}-\theta)]^2 = \frac{1}{\sqrt{n}}\cdot O_p(1) \xrightarrow{p} 0$$

**第六步：[Slutsky定理](Slutsky定理)**

$$\sqrt{n}\left[g(\hat{\theta})-g(\theta)\right] \xrightarrow{d} g'(\theta)\cdot N(0,\sigma^2) = N\left(0, [g'(\theta)]^2\sigma^2\right)$$

---

## 三、方差近似的理论依据

由上述定理，当 $n$ 较大时：

$$g(\hat{\theta}) \stackrel{\cdot}{\sim} N\left(g(\theta), \frac{[g'(\theta)]^2\sigma^2}{n}\right)$$

