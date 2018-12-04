| [Linux][lin-link] | [Codecov][cov-link] |
| :---------------: | :-----------------: |
| ![lin-badge]      | ![cov-badge]        |

[lin-badge]: https://travis-ci.org/phillyfan1138/option_price_faas.svg "Travis build status"
[lin-link]:  https://travis-ci.org/phillyfan1138/option_price_faas "Travis build status"
[cov-badge]: https://codecov.io/gh/phillyfan1138/option_price_faas/branch/master/graph/badge.svg
[cov-link]:  https://codecov.io/gh/phillyfan1138/option_price_faas

## Option Price FAAS

### API Documentation

[Docs](https://finside.org/developers)

### Pricer
These are a set of lambda functions for pricing options when assets follow an extended Jump Diffusion process with stochastic time clock correlated with the diffusion portion of the asset process. See [Carr and Wu 2004](http://faculty.baruch.cuny.edu/lwu/papers/timechangeLevy_JFE2004.pdf) and [Huang and Wu 2004](https://pdfs.semanticscholar.org/0065/9b64e38e097f9df521ea5393ede9a2b6f824.pdf?_ga=2.75168529.2091536158.1531661727-680909490.1531661727).  

### More documentation/design evidence
Additional documentation is available at the [fang_oost_charts](https://github.com/phillyfan1138/fang_oost_cal_charts).

### Migrate to pure rust

`cargo build --target x86_64-unknown-linux-musl --release`

`cat ./tests/parameter1.json | sudo docker run --rm -v "$PWD":/var/task -i -e DOCKER_LAMBDA_USE_STDIN=1 lambci/lambda:provided ./target/x86_64-unknown-linux-musl/release/pricer`