当我们将x=x(u,v) ,y=y(u,v)还原时，如何求dxdy=f（u，v）dudv呢
这涉及到一个微分面积换元的伸缩尺度
在微分时，我们近似坐标$（\Delta x,\Delta y）到（ \Delta u,\Delta v）$是线性变换，
$\Delta x$在分别由u，v贡献，所以$\Delta x=\frac{\partial x}{\partial u}\Delta u+\frac{\partial x}{\partial v}\Delta v$
$\Delta y=\frac{\partial y}{\partial u}\Delta u+\frac{\partial y}{\partial v}\Delta v$
$\begin{pmatrix} \Delta x \\ \Delta y \end{pmatrix} \approx \begin{pmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\ \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{pmatrix} \begin{pmatrix} \Delta u \\ \Delta v \end{pmatrix}$
这个公式一方面表示同样的基底经过一个矩阵变换，坐标的转变，也揭示了同样的坐标在基底改变后的表示的变化这两者是一样的。
同样的坐标基底变化后，由正交基底转变为一般不正交基底，长方形的面积变为平行四边形的面积。
基底为$（\frac{\partial x}{\partial u},\frac{\partial y}{\partial u}）$,$（\frac{\partial x}{\partial v},\frac{\partial y}{\partial v}）$
他们的叉乘就是平行四边形的面积
根据叉乘的行列式算法就是上面的雅可比行列式，$\Delta u  \Delta v$为对这个平行四边形进行伸缩，面积等于det（$\begin{pmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\ \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{pmatrix}$）dudv
所以有$dxdy=\frac{\partial(x,y)}{\partial(u,v)} = \begin{vmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\[6pt] \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{vmatrix}dudv$
这里是因为（x，y）的基底为（1，0）和（0，1），其雅可比行列式就为1所以无所谓，若是dx和dy的基底为（a，b），（c，d）
则有$\begin{vmatrix} a & c \\[6pt] b & d \end{vmatrix}dxdy=\begin{vmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\[6pt] \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{vmatrix}dudv$







