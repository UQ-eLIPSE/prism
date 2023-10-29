# Make folder for mantakey
[ ! -d "./server/tmp" ] && mkdir ./server/tmp

if [ ! -f "./server/tmp/prism-tst-id_rsa" ]; then
    wget --no-parent -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz
    [ $? -ne 0 ] && echo "Error downloading the file." && exit 1
    tar -xvzf prism-tst.tar.gz
    mv prism-tst/prism-tst-id_rsa ./server/tmp
    rm -rf prism-tst.tar.gz prism-tst
fi