# 安装graphicsmagick

安装 [graphicsmagick](http://www.graphicsmagick.org), 才能将JPG/PNG格式的图片转为咕咕机可打印的`BMP点位图`.

Mac OS X：

```sh
brew install graphicsmagick
```

Linux(Centos)：

```sh
# Install build dependencies
yum install -y gcc libpng libjpeg libpng-devel libjpeg-devel ghostscript libtiff libtiff-devel freetype freetype-devel

# Get GraphicsMagick source
wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.9.tar.gz
tar zxvf GraphicsMagick-1.3.9.tar.gz

# Configure and compile
cd GraphicsMagick-1.3.9
./configure --enable-shared
make && make install

# Ensure everything was installed correctly
gm version
```
