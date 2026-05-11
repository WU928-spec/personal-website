---
tags:
  - 三角不等式
  - 固定思想
  - 极限的保号性
  - 数列的极限定义证明
data: 2024.11.28
---
定理描述：
$$
如果存在b_n单调递增，且b_n收敛于正无穷。若\lim_{n\to\infty}\frac{a_{n}-a_{n-1}}{b_n-b_{n-1}}=A，A可为\infty。
$$
$$
则\lim_{n\to\infty}\frac{a_n}{b_n}=A
$$
$$
b_n递减，且b_n收敛于0，a_n收敛于0。若\lim_{n\to\infty}\frac{a_{n}-a_{n-1}}{b_n-b_{n-1}}=A，A可为\infty。则\lim_{n\to\infty}\frac{a_n}{b_n}=A
$$
证明：
$$
这个stolz定理，实际上就是离散型的洛必达法则。证明的思路用到了固定思想和配对思想。
$$
$$
	当A为实数时，\because\lim_{n\to\infty}\frac{a_{n}-a_{n-1}}{b_n-b_{n-1}}=A\therefore存在N\in{Z},当n\geq{N}时,|\frac{a_n-a_{n-1}}{b_n-b_{n-1}}-A|<\xi
$$
$$
整理得A+\xi<\frac{a_n-a_{n-1}}{b_n-b_{n-1}}<A+\xi，\because b_n递增\therefore b_n-b_{n-1}>0,乘到左右两边得
$$
$$
(A+\xi)(b_n-b_{n-1})<a_n-a_{n-1}<(A+\xi)(b_n-b_{n-1})
$$
$$
这个式子对所有n\geq{N}都成立，将这些式子累加得(A+\xi)(b_n-b_N)<a_n-a_N<(A+\xi)(b_n-b_N)
$$
$$
整理得，|\frac{a_n-a_{N}}{b_n-b_{N}}-A|<\xi,到这里我们就完成了固定的工作
$$
$$
我们想要得到的是|\frac{a_n}{b_n}-A|<\xi,我们观察\frac{a_n-a_{N}}{b_n-b_{N}}-A 如何变形成我们想要的\frac{a_n}{b_n}-A
$$
$$
可以观察到\frac{a_n}{b_n}=\frac{a_n-a_{N}}{b_n-b_{N}}\frac{b_n-b_N}{b_n}+\frac{a_N}{b_n}$$
$$
\frac{a_n}{b_n}-A=(\frac{a_n-a_N}{b_n-b_N}-A)(\frac{b_n-b_N}{b_n})+\frac{a_N-Ab_N}{b_n}
$$
$$
\because\lim_{n\to\infty}\frac{b_n-b_N}{b_n}=1,所以当存在N\in Z,当n\geq N_1,\frac{b_n-b_N}{b_n}<2
$$
$$
\because\lim_{n\to\infty}{\frac{a_N-Ab_N}{b_n}}=0,\therefore \exists N_2\in Z,当n>N_2时，\frac{a_N-Ab_N}{b_n}<\xi
$$
$$
当n>max \{ N_1, N,N_2\} 
$$
$$
|\frac{a_n}{b_n}-A|
$$
$$
=|(\frac{a_n-a_N}{b_n-b_N}-A)(\frac{b_n-b_N}{b_n})+\frac{a_N-Ab_N}{b_n}|\leq |(\frac{a_n-a_N}{b_n-b_N}-A)(\frac{b_n-b_N}{b_n})|+|\frac{b_n-b_N}{b_n}|<2\xi+\xi=3\xi
$$
得证。其中利用了极限的保号性和三角不等式，对于其他情况也是类似的。

