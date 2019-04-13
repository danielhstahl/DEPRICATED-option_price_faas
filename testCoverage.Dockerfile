FROM xd009642/tarpaulin:latest
#RUN rustup target add x86_64-unknown-linux-musl
#RUN RUSTFLAGS="--cfg procmacro2_semver_exempt" cargo install cargo-tarpaulin
WORKDIR /code
COPY src src
COPY Cargo.toml .
COPY Cargo.lock .
COPY benches benches
RUN cargo clean
RUN cargo bench
RUN cargo tarpaulin --out Xml
RUN ls -la

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
COPY --from=0 /code/cobertura.xml .