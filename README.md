# Dysk sieciowy
Praca konkursowa na projekt informatyczny

Dysk sieciowy działa na dystrybucjach Linuxa bazowanych na Debianie (testowane na Ubuntu Server 18.04 LTS i Raspbian Stretch Lite).
Z powodu braku wystarczającej ilości czasu instalację trzeba wykonać ręcznie.
Oprogramowanie jest na chwilę obecną we wczesnej fazie rozwoju w związku z czym aby uzyskać możliwość zapisu i modyfikacji plików należy ręcznie doinstalować usługę FTP lub SMB i skonfigurować.


UWAGA! Całą instalację i uruchamianie należy wykonywać z poziomu konta „root”.

## Instalacja

W celu instalacji należy najpierw zainstalować pakiety npm i nodejs:

```shell
apt update && apt upgrade
apt install npm nodejs
```

Następnie trzeba utworzyć 2 katalogi:

```shell
mkdir /media/nas
mkdir /opt/serwer-plikow
```

W katalogu /media/nas można opcionalnie ustawić punkt montowania dla zewnętrznego dysku jeśli dane chcemy przechowywać na osobnym nośniku.

Do katalogu „/opt/serwer-plikow” należy przenieść z archiwum zawartość katalogu „serwer-plikow” z płyty, a do katalogu „/media/nas” zawartość katalogu „nas” (uwaga, zawiera ukryty katalog „.system”).

Następnie ustawiamy dowiązania:

```shell
ln -s /media/nas/.system/avatary/ /opt/serwer-plikow/html/avatary
ln -s /media/nas/.system/avatary/ /opt/serwer-plikow/html-logowanie/avatary
```

Przechodzimy do katalogu „/opt/serwer-plikow” i instalujemy zależności:

```shell
cd /opt/serwer-plikow
npm i express express-session express-socket.io-session filepreview http mime-types ncp node-thumbnail passwd-linux process-list ps-list socket.io body-parser
```

Na koniec musimy ręcznie dodać pierwszego użytkownika:

```shell
useradd -d "/media/nas" administrator
passwd administrator
```

Teraz możemy uruchomić program.

```shell
./start.sh
```

Dostęp do panelu logowania uzyskamy wchodząc w przeglądarce na adres urządzenia (koniecznie poprzez protokół https:);
