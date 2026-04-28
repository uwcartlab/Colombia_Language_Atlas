import csv
import os
from pydub import AudioSegment

readFileName = "audio/audio_clips.csv"
f=open(readFileName,"r")
header=f.readline()

dept = ["Medellin","Cali","Manizales","Bogotá","Valledupar","SantaMarta","Cartagena","Barranquilla"]

"""
#audio_conversion
for d in dept:
    p = 'audio/audio/' + d + '-IWs'
    #scan folder 
    for e in os.scandir(p):
        print(e)
        if e.is_file() and ".wav" in e.name :
            clip = AudioSegment.from_wav(e.path)
            clip.export('audio/clips2/' + e.name + '.mp3',format="mp3")"""

#table creation
with open('clips.csv', 'w') as csvfile:
     #set CSV options
    filewriter = csv.writer(csvfile, delimiter=',',
                    quotechar='"', quoting=csv.QUOTE_MINIMAL)
    #create header row based on the GLO attributes
    filewriter.writerow(["Province","Participant","Audio","Clip"])
    p = 'audio/clips'
    for e in os.scandir(p):
        temp = e.name.replace(" ","")
        temp = temp.replace("-","")
        temp = temp.replace("IW","")
        temp = temp.replace(".wav.mp3","")
        temp = temp.split("clip")
        prov = temp[0][-2:]
        print(prov)
        try:
            clip = "clip " + temp[1]
            filewriter.writerow([prov,temp[0],e.name,("clip " + temp[1])]) 
        except:
             filewriter.writerow([prov,temp[0],e.name,("clip")]) 

