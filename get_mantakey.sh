#!/bin/bash

wget --no-parent  -r http://stluc.manta.uqcloud.net/elipse/public/PRISM-TST/prism-tst.tar.gz -O prism-tst.tar.gz

tar -xvzf prism-tst.tar.gz

mv prism-tst/prism-tst-id_rsa tmp

rm -rf prism-tst.tar.gz prism-tst