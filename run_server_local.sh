#!/bin/bash
declare -A PROJECTS

# The following functions are called in the Main Execution Flow in this order:
# 1. load_projects: Generates a list of projects from 'projects.txt'.
# 2. select_project: Assigns target project parameters.
# 3. get_manta_key: Retrieves credentials for accessing Manta storage.
# 4. get_mongo_dump: Downloads the necessary MongoDB data for the selected project.
# 5. build_and_run:
#    5.1. create_env_file: Creates a .env file for environment configuration.
#    5.2. ensure_local_mongodb: Checks if MongoDB is not running locally and starts it if needed.
#    5.3. restore_data: Populates MongoDB with the required data (seeding).
#    5.4. run_yarn_start: Initiates the application using 'yarn start'.

load_projects() {
    while IFS="|" read -r id dataname restore_data restore_filename; do
        PROJECTS["$id,dataname"]=$dataname
        PROJECTS["$id,restore_data"]=$restore_data
        PROJECTS["$id,restore_filename"]=$restore_filename
    done < projects.txt
}

select_project() {
    read -p "Choose a project number (e.g. 1, 2): 1. AGCO360, 2. ANLB, 3. Kingston, 4. Urban Water, 5. Camp Hill " project_name
    project="${project_name::1}"
    DATANAME="${PROJECTS["$project,dataname"]}"
    RESTORE_DATA="${PROJECTS["$project,restore_data"]}"
    RESTORE_FILENAME="${PROJECTS["$project,restore_filename"]}"

    if [ -z "$DATANAME" ]; then
        echo "Invalid project number."
        exit 1
    fi
}

get_mantakey() {
    # Make folder for mantakey
    [ ! -d "./tmp" ] && mkdir ./tmp

    if [ ! -f "tmp/prism-tst-id_rsa" ]; then
        wget --no-parent -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz
        [ $? -ne 0 ] && echo "Error downloading the file." && exit 1
        tar -xvzf prism-tst.tar.gz
        mv prism-tst/prism-tst-id_rsa tmp
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
        scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/prism_mongodumps/ .
        [ $? -ne 0 ] && echo "Error downloading dumpdata. Check your username and accessibility" && exit 1
    else
        echo "Data files exist at ./prism_mongodumps"
    fi
}

restore_data() {
    cd "./prism_mongodumps/$RESTORE_DATA"
    mongorestore "$RESTORE_FILENAME"
    
}

build_and_run() {
    [ ! -f "${DATANAME}.local" ] && echo "No file named ${DATANAME}.local" && exit 1
    cp "${DATANAME}.local" .env
    ! nc -z 127.0.0.1 27017 && systemctl start mongod       
    restore_data
    read -p "Do you need run yarn install? (y/n) " yarn_option
    [[ "$download_option" =~ ^[yY]$ ]] && yarn && yarn watch
    [[ "$download_option" =~ ^[nN]$ ]] && yarn watch
}

# Main execution flow
# Check Server Port
if nc -z 127.0.0.1 8000 ; then
    echo "port 8000 InUse"
    exit 1
fi

echo "Ports checked!"

# Run server build steps
load_projects
select_project
get_mantakey
get_mongo_dump
build_and_run
