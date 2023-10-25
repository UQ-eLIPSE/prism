#!/bin/sh

# Args
# $1. The host that the desired db is on. Optional. Defaults to "localhost"

DB=andrew_liveris

# On docker, our host would be something like mongodb (the container name). Otherwise point to localhost instead
COUNT=$#
HOST="mongodb"
if [ $COUNT -eq 1 ]; then
	HOST=$1
fi

for f in *.json; do
	mongoimport --host=$HOST --db=$DB --collection=${f%.*} --drop --file=$f
done