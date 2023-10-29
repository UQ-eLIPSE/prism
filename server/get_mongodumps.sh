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

get_mongo_dump