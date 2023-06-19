FROM golang

WORKDIR /go/src/github.com/btcsuite
RUN git clone https://github.com/btcsuite/btcwallet.git
RUN git clone https://github.com/btcsuite/btcd.git

WORKDIR /go/src/github.com/lightningnetwork
RUN git clone https://github.com/lightningnetwork/lnd.git

# btcd
RUN cd /go/src/github.com/btcsuite/btcd && \ 
    GO111MODULE=on go install -v . ./cmd/...

# btcwallet
RUN cd /go/src/github.com/btcsuite/btcwallet && \
    GO111MODULE=on go install -v . ./cmd/...

# lnd
RUN cd /go/src/github.com/lightningnetwork/lnd && \  
    make && \
    make install

COPY lnd.conf /root/.lnd/
COPY btcd.conf /root/.btcd/
COPY btcwallet.conf /root/.btcwallet/

WORKDIR /root
COPY .aliases .
RUN cat .aliases > /root/.bashrc
COPY entrypoint.sh /usr/local/bin/
# ENTRYPOINT ["tail", "-f", "/dev/null"]
ENTRYPOINT ["entrypoint.sh"]