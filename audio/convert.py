import csv
from pydub import AudioSegment

readFileName = "audio/audio_clips.csv"
f=open(readFileName,"r")
header=f.readline()

dept = "Barranquilla"

for i, line in enumerate(f):
    record=line.strip().split(",")
    clipFile = 'audio/' + dept + '-IWs/IW - ' + record[0] + ' ' + record[2] + '.wav'
    clip = AudioSegment.from_wav(clipFile)
    clip.export('audio/clips/IW - ' + record[0] + ' ' + record[2] + '.mp3',format="mp3")

