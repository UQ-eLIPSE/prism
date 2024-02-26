#!/bin/bash
# The following functions are called in the Main Execution Flow in this order:

# 1. get_manta_key: Retrieves access credentials for Manta storage.
# 2. get_mongo_dump: Downloads the necessary MongoDB data for the selected project.
# 3. build_and_run:
#    3.1. create_env_file: Generates a .env file for environment configuration.
#    3.2. start_docker_compose: Initiates Docker Compose, optionally rebuilding if needed.
#    3.3. restore_data_in_mongodb: Restores data in the MongoDB instance.
#    3.4. display_information: Displays relevant information about the process.

# For create .env file in server
DATANAME=".env.prism_uat.example"
# default mongorestore file name 
RESTORE_FILENAME="prism_uat_v0"

get_mantakey() {
    # Make folder for mantakey
    [ ! -d "./server/opt/tmp" ] && mkdir -p ./server/opt/tmp
    echo "check the opt/tmp"

    if [ ! -f "./server/opt/tmp/prism-tst-id_rsa" ]; then
        wget --no-parent -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz
        [ $? -ne 0 ] && echo "Error downloading the file." && exit 1
        tar -xvzf prism-tst.tar.gz
        mv prism-tst/prism-tst-id_rsa ./server/opt/tmp
        rm -rf prism-tst.tar.gz prism-tst
    fi
}

get_mongo_dump() {
    read -p "Do you want to download Mongo dump data? (y/n): " download_option
    if [[ "$download_option" =~ ^[yY]$ ]]; then
        # Provide Username 
        read -p "Please enter username: " USERNAME
        if [ ! "$USERNAME" ]; then
            echo "ERROR: invalid USERNAME"
            exit 1
        fi
        # Download dumpdata
        # Make folder for dumpdata
        [ ! -d "./server/prism_mongodumps" ] && mkdir -p ./server/prism_mongodumps
        scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/prism_mongodumps/prism_uat/ ./server/prism_mongodumps/
        [ $? -ne 0 ] && echo "Error downloading dumpdata. Check your username and accessibility" && exit 1
    else
        echo "Data files exist at ./server/prism_mongodumps/prism_uat"
    fi
}

restore_data() {
    cd "./server/prism_mongodumps/prism_uat"
    mongorestore "$RESTORE_FILENAME"
    cd ../../..
  
}

build_and_run() {
    [ ! -f "./server/${DATANAME}" ] && echo "No file named $DATANAME" && exit 1
    cp ./server/"${DATANAME}" ./server/.env
    echo "created server env file!"
    
    read -p "Do you want to build the Docker images before starting? (y/n): " build_option
    build_flag=""
    [[ "$build_option" =~ ^[yY]$ ]] && build_flag="--build"
    COMPOSE_HTTP_TIMEOUT=500

    # Run Docker Compose without sudo
    docker-compose up -d $build_flag
    # Check the exit status of the previous command
    if [ $? -ne 0 ]; then
        # If the previous command failed, run with sudo
        sudo docker-compose up -d $build_flag
    fi

    restore_data
    echo "Container successfully running in the background. You can:"
    echo "1) Check its status with command: docker ps"
    echo "2) Monitor its logs with command: docker logs -f CONTAINER_ID"
}

# Main execution flow
# Check Ports availablity for Server, Docker and MongoDB
nc -z 127.0.0.1 8000 && echo "port 8000 InUse" && exit 1
nc -z 127.0.0.1 8080 && echo "port 8080 InUse, set it free for Docker Proxy" && exit 1
nc -z 127.0.0.1 27017 && echo "27017 in Use pls set it free for docker proxy" && exit 1
echo "Ports checked!"


# Run server build steps
get_mantakey
get_mongo_dump
build_and_run