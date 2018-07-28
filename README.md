## Option Price FAAS

### Pricer
These are a set of lambda functions for pricing options when assets follow an extended Jump Diffusion process with stochastic time clock correlated with the diffusion portion of the asset process. See [Carr and Wu 2004](http://faculty.baruch.cuny.edu/lwu/papers/timechangeLevy_JFE2004.pdf) and [Huang and Wu 2004](https://pdfs.semanticscholar.org/0065/9b64e38e097f9df521ea5393ede9a2b6f824.pdf?_ga=2.75168529.2091536158.1531661727-680909490.1531661727).  

### Calibrator
Calibration of Levy processes can be tricky due to the highly non-linear aspects of calibration.  To get around this, I employ a method pioneered by [Belomestny and Reis](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.90.8837&rep=rep1&type=pdf).  Essentially, instead of calibrating prices I calibrate characteristic functions by taking the market prices and deriving an empirical characteristic function.

### More documentation/design evidence
Additional documentation is available at the [fang_oost_charts](https://github.com/phillyfan1138/fang_oost_cal_charts).