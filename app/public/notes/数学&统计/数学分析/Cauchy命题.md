---
tags:
  - 固定思想
  - 极限的保号性
  - 三角不等式
  - 数列的极限定义证明
data: 2024-11-28
---
 #连加型$\lim_{n \to \infty} a_n = a$，则 $\lim_{n \to \infty} \frac{a_1 + a_2 + \cdots + a_n}{n} = a$。

证明：
$$
\lim_{n \to \infty} \left| \frac{a_1 + a_2 + \cdots + a_n }{n}-a \right| = \lim_{n \to \infty} \frac{1}{n} \left| \sum_{k=1}^n (a_k - a) \right|
$$

$$
\lim_{n \to \infty} \frac{1}{n} \left| \sum_{k=1}^n (a_k - a) \right| = \lim_{n \to \infty} \frac{1}{n} \left( \sum_{k=1}^N (a_k - a) + \sum_{k=N+1}^n (a_k - a) \right) \quad \text\
$$

由于 $\lim_{n \to \infty} a_n = a$，存在 $N \in \mathbb{N}^+$，当 $n > N$ 时，有 $|a_n - a| < \epsilon$

$$
\lim_{n \to \infty} \frac{1}{n} \left| \sum_{k=1}^N (a_k - a) \right| = 0
$$

存在 $M \in \mathbb{N}^+$，当 $n > M$，有 $\left| \frac{1}{n} \sum_{k=1}^N (a_k - a) \right| = 0$

令 $N_1 = \max\{N, M\}$，当 $n > N_1$ 时，

$$
\frac{1}{n} \left| \sum_{k=1}^N (a_k - a) + \sum_{k=N+1}^n (a_k - a) \right| \leq \frac{1}{n} \left| \sum_{k=1}^N (a_k - a) \right| + \frac{1}{n} \left| \sum_{k=1}^N (a_k - a) \right|
$$

$$
< \epsilon + \frac{n-N}{n} \epsilon < 2\epsilon
$$
得证。
#根号型
$$
若\lim_{n \to \infty} {a_n}=a
$$
$$
则\lim_{n \to \infty} \sqrt[n]{a_1 a_2 \cdots a_n} = a
$$