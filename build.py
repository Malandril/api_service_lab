import configparser
import os
import subprocess as sp
import time


def treat_folder(folder, commands):
    start = time.time()
    os.chdir(folder)
    print(f"=====Building {folder}=====")
    for command in commands:
        process = sp.run(command, shell=True)
        print(process.stderr)
        if process.returncode != 0:
            print("build failed")
            return
    print(f"build of {folder} succeeded in {time.time() - start} seconds")
    os.chdir("..")


def main():
    folders = ["coursier", "coursier-ws", "customer-ws", "delivery_man_account", "eta_calculator", "payment", "order", "restaurant", "restaurant-ws"]
    for folder in folders:
        treat_folder(folder, [["npm", "install"]])


if __name__ == '__main__':
    main()
