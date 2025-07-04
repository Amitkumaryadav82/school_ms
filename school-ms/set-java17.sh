#!/bin/bash
# Set Java 17 as default for the current session
export JAVA_HOME=/home/codespace/java/17.0.15-ms
export PATH=$JAVA_HOME/bin:$PATH
echo "Java 17 environment configured"
java -version
