USERNAME=$1

if [ ! $USERNAME ]
then
    echo "USAGE: $0 mango_username"
    exit 1
fi

scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/prism_mongodumps ./prism_mongodumps/