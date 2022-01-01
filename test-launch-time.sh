#!/usr/bin/env bash

cd packages/cli/core
for i in $(seq 1 100)
do
    echo "=========== ${i} ==========="
    npx modern
done
