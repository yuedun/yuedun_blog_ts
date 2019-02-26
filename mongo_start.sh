#!/bin/bash

# 服务器mongodb启动
/usr/local/mongodb/bin/mongod --dbpath=/usr/local/mongodb/data --logpath=/usr/local/mongodb/logs --logappend --auth --fork