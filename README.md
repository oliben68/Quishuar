# Quishuar

* To build simply run **make**

* To install the webiste in a directory edit the **.deploy** file to indicate the directory you to deploy it to (relative path).

* **make clean** will perform a cleanup 

**IMPORTANT!**
Make sure your flavor of posix system contains a *writable* **/tmp** directory otherwise you will need to update the **.tmp** file with the location where you want the tar to be created from.