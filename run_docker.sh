#!/bin/bash

USERNAME=$1
DATANAME=$2 
RESTORE_DATA=$3
RESTORE_FILENAME=$4

# Check Arguments
if [ ! "$USERNAME" ] || [ ! "$DATANAME" ] || [ ! "$RESTORE_DATA" ] || [ ! "$RESTORE_FILENAME" ]; then
    echo "ERROR: Missing one or more required arguments."
    echo "USAGE: $0 <mango_username> <data_name> <restore_data> <restore_filename>"
    exit 1
fi

# Create Environment file
if [ ! -f "$DATANAME" ]; then
    echo "no file named $DATANAME"
    exit 1
else
    cp "$DATANAME" .env
fi

# Make folder for mantakey
[ ! -d "./tmp" ] && mkdir ./tmp

# Get_mantakey
wget --no-parent  -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz
if [ $? -ne 0 ]; then
    echo "Error downloading the file."
    exit 1
fi
tar -xvzf prism-tst.tar.gz
mv prism-tst/prism-tst-id_rsa tmp
rm -rf prism-tst.tar.gz prism-tst

# Get Mongo DumpData
# Check if need download data for ./prism_mongodumps
read -p "Do you want to download Mongo dump data? (y/n): " download_option
if [[ "$download_option" =~ ^[yY]$ ]]; then
    scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/prism_mongodumps ./prism_mongodumps/
    if [ $? -ne 0 ]; then
        echo "Error downloading dumpdata. Check your UQname and accessibility"
        exit 1
    fi
else
    echo "Data files exist at ./prism_mongodumps"
fi

# Check if need build container
read -p "Do you want to build the Docker images before starting? (y/n): " build_option
if [[ "$build_option" =~ ^[yY]$ ]]; then
    build_flag="--build"
else
    build_flag=""
fi

# Build and run your Docker container in the background
docker-compose up -d

# Echo a success message
echo "Container built successfully and running in the background. You can:"
echo "1) Check its status with command: docker ps"
echo "2) Monitor its logs with command: docker logs -f CONTAINER_ID"

# Restore Data
cd "./prism_mongodumps/$RESTORE_DATA"
mongorestore "$RESTORE_FILENAME"
