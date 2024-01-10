#!/bin/bash
# The following functions are called in the Main Execution Flow in this order:
# 1. load_projects: Loads project data from 'projects.txt'.
# 2. select_project: Selects the target project and assigns its parameters.
# 3. get_manta_key: Retrieves access credentials for Manta storage.
# 4. get_mongo_dump: Downloads the necessary MongoDB data for the selected project.
# 5. build_and_run:
#    5.1. create_env_file: Generates a .env file for environment configuration.
#    5.2. start_docker_compose: Initiates Docker Compose, optionally rebuilding if needed.
#    5.3. restore_data_in_mongodb: Restores data in the MongoDB instance.
#    5.4. display_information: Displays relevant information about the process.
# 6. build_and_run_client: start install yarn on client folder and run yarn start on client

IDS=()
DATANAMES=()
RESTORE_DATAS=()
RESTORE_FILENAMES=()

load_projects() {
    index=0
    while IFS="|" read -r id dataname restore_data restore_filename; do
        IDS[$index]=$id
        DATANAMES[$index]=$dataname
        RESTORE_DATAS[$index]=$restore_data
        RESTORE_FILENAMES[$index]=$restore_filename
        index=$((index+1))
    done < projects.txt
}

select_project() {
    read -p "Choose a project number (e.g. 1, 2): 1. AGCO360, 2. ANLB, 3. Kingston, 4. Urban Water, 5. Camp Hill, 6. aeb, 7. uqlakes  " project_name
    project_index=$((project_name - 1))

    DATANAME="${DATANAMES[$project_index]}"
    RESTORE_DATA="${RESTORE_DATAS[$project_index]}"
    RESTORE_FILENAME="${RESTORE_FILENAMES[$project_index]}"

    if [ -z "$DATANAME" ]; then
        echo "Invalid project number."
        exit 1
    fi
}

get_mantakey() {
    # Make folder for mantakey
    [ ! -d "./server/tmp" ] && mkdir ./server/tmp

    if [ ! -f "./server/tmp/prism-tst-id_rsa" ]; then
        wget --no-parent -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz
        [ $? -ne 0 ] && echo "Error downloading the file." && exit 1
        tar -xvzf prism-tst.tar.gz
        mv prism-tst/prism-tst-id_rsa ./server/tmp
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
        scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/prism_mongodumps/ ./server/
        [ $? -ne 0 ] && echo "Error downloading dumpdata. Check your username and accessibility" && exit 1
    else
        echo "Data files exist at ./server/prism_mongodumps"
    fi
}

restore_data() {
    cd "./server/prism_mongodumps/$RESTORE_DATA"
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
    docker-compose -f ./server/docker-compose-server.yml up -d $build_flag

    # Check the exit status of the previous command
    if [ $? -ne 0 ]; then
        # If the previous command failed, run with sudo
        sudo docker-compose -f ./server/docker-compose-server.yml up -d $build_flag
    fi

    restore_data
    echo "Container successfully running in the background. You can:"
    echo "1) Check its status with command: docker ps"
    echo "2) Monitor its logs with command: docker logs -f CONTAINER_ID"
}

build_and_run_client(){
    cp ./client/.env.develop.example ./client/.env
    echo "created client env file!"
    cd ./client
    read -p "Before start client, do you need install with yarn (please choose yes for a first run)? (y/n): " yarn_option
    [[ "$yarn_option" =~ ^[yY]$ ]] && sudo yarn   
    sudo yarn start
}

# Main execution flow
# Check Ports availablity for Server, Docker and MongoDB
nc -z 127.0.0.1 8000 && echo "port 8000 InUse" && exit 1
nc -z 127.0.0.1 8080 && echo "port 8080 InUse, set it free for Docker Proxy" && exit 1
nc -z 127.0.0.1 27017 && echo "27017 in Use pls set it free for docker proxy" && exit 1
echo "Ports checked!"


# Run server build steps
load_projects
select_project
get_mantakey
get_mongo_dump
build_and_run
build_and_run_client