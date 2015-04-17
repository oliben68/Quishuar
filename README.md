# Quishuar

* To build simply run **make**

* **make deploy** deploys the webiste to the a directory in **.deploy** file (asbolute path).

* **make clean** will perform a cleanup 

**IMPORTANT!**
Make sure your flavor of posix system contains a *writable* **/tmp** directory otherwise you will need to update the **.tmp** file with the location where you want the tar to be created from.