# Sintetiza falas com a voz do Windows (System.Speech, offline). Chamado por scripts/tts-falas.js.
# Recebe um JSON com [{ ssml, out }]; o texto nunca passa pela linha de comando.
param([Parameter(Mandatory = $true)][string]$JobsFile)

Add-Type -AssemblyName System.Speech
$jobs = Get-Content -Raw -Encoding UTF8 $JobsFile | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  foreach ($job in $jobs) {
    $synth.SetOutputToWaveFile($job.out)
    $synth.SpeakSsml($job.ssml)
  }
} finally {
  $synth.SetOutputToNull()
  $synth.Dispose()
}
