#!/bin/bash -u

cd `dirname $0`
cd .. && \
    yarn deploy:polygon && \
    yarn deploy:meter && \
    yarn deploy:rinkarby && \
    yarn deploy:rinkeby && \
    yarn deploy:ropsten && \
    ./scripts/sync-contracts.sh
