FROM rustlang/rust:nightly
WORKDIR /code
COPY src src
COPY Cargo.toml .
COPY Cargo.lock .
COPY benches benches
RUN cargo clean
RUN cargo bench
RUN curl -L https://github.com/mozilla/grcov/releases/download/v0.4.3/grcov-linux-x86_64.tar.bz2 | tar jxf -
ENV CARGO_INCREMENTAL=0
ENV RUSTFLAGS="-Zprofile -Ccodegen-units=1 -Cinline-threshold=0 -Clink-dead-code -Coverflow-checks=on -Zno-landing-pads"
RUN cargo build --verbose $CARGO_OPTIONS
RUN cargo test --verbose $CARGO_OPTIONS
RUN apt-get update
RUN apt-get install -y zip
RUN zip -0 ccov.zip `find . \( -name "pricer*.gc*" -o -name "riskmetric*.gc*" -o -name "density*.gc*" -o -name "utils*.gc*" \) -print`
RUN unzip -l ccov.zip
RUN ./grcov ccov.zip -s . -t lcov --llvm --branch --ignore-not-existing --ignore-dir "/*" -o lcov.info

FROM rust:1.33-slim
RUN rustup target add x86_64-unknown-linux-musl
WORKDIR /code
COPY src src
COPY benches benches
COPY Cargo.toml .
COPY Cargo.lock .
RUN apt-get update
RUN apt-get install -y gcc
RUN apt-get install -y musl-tools
RUN apt-get install -y musl-dev
RUN cargo build --release --target=x86_64-unknown-linux-musl
COPY --from=0 /code/lcov.info .