#!/bin/bash
netstat -nlp | grep 3001 | awk '{print $7}' | cut -d/ -f 1 | xargs kill -9
