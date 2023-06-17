FROM golang

WORKDIR /go/src/github.com/btcsuite
RUN git clone https://github.com/btcsuite/btcd.git
RUN git clone https://github.com/btcsuite/btcwallet.git

WORKDIR /go/src/github.com/btcsuite/btcd
RUN GO111MODULE=on go install -v . ./cmd/...

WORKDIR /go/src/github.com/btcsuite/btcwallet
RUN GO111MODULE=on go install -v . ./cmd/...

WORKDIR /root

COPY btcd.conf /root/.btcd/

COPY .alias .
RUN cat .alias > /root/.bashrc

COPY entrypoint.sh /usr/local/bin/
ENTRYPOINT ["entrypoint.sh"]