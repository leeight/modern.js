#!/usr/bin/env bash

export DISABLE_V8_COMPILE_CACHE=1
cd packages/cli/core
for i in $(seq 1 100)
do
    echo "=========== ${i} ==========="
    npx modern
done
