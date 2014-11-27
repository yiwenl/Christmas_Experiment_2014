import sys
import os
import re

# ---------- Common variables -------------------------------------
projectName = 'blow'
deployPath = '../deploy'
jsPath = '/js'
jsRootPath = '/js'

# ---------- Config variables -------------------------------------
jsScriptInserterJsPath = 'js'

jsCompiledDir = '/compiled/'


# ---------- Compiled vs Dev flag -------------------------------------
isSetAsCompiled = True
if sys.argv[1]:
    if sys.argv[1] == 'false':
        isSetAsCompiled = False


# ---------- Javascript Finder -------------------------------------
def findJS(aFilePath, aJSPath, aJSRootPath):
    print '    Scanning file...'
    src_file = open(aFilePath, 'r')
    string = src_file.read()
    src_file.close()

    print '    Extracting JS files from ' + aFilePath + '...'

    # GRAB ALL JS SRC ATTRIBUTES
    s = re.findall( r'"(.*?)"', string)
    files = []
    print "    Found " + str(len(s)) + " script tags"
    for item in s:
        if re.match(jsScriptInserterJsPath, item):
        # WE WANT THIS ONE
            if item.find("compile") == -1:
                files.append(item.replace(jsScriptInserterJsPath, '../deploy/js', 1))
    # print '[%s]' % ',\n '.join(map(str, files))
    print '    Found ' + str(len(files)) + ' JS files'

    return files


# ---------- JS compiler -------------------------------------
def compileJS(aFiles, aOutputFileName, aOutputPath):
    print '    Compiling JS...'
    code = ''
    for f in aFiles:
        code += ' --js=' + f
    os.system("java -jar compiler.jar --define='ENABLE_DEBUG=true' --language_in=ECMASCRIPT5 --warning_level=QUIET " + code + " --js_output_file " + aOutputFileName)
    print '    Moving compressed file ' + aOutputFileName + ' to' + aOutputPath
    os.system("mv " + aOutputFileName + " " + aOutputPath + aOutputFileName)
    #os.unlink("main.js")   # comment this line if you want to make sense of the errors


# ---------- Section compiler -------------------------------------
def compileDesktop(aHtmlPath, aJSOutputDirectory):
    jsFiles = findJS(aHtmlPath, jsPath, jsRootPath)
    jsCompiledOutputName = projectName+".min.js"
    compileJS(jsFiles, jsCompiledOutputName, aJSOutputDirectory)
    print '    COMPILED '
    jsFiles = []


# ---------- Toggles Comments: COMPILED vs DEV -------------------------------------
def setCompiled(aFilePath, aIsCompiled):
    print '    Set as compiled...' + str(aIsCompiled)
    src_file = open(aFilePath, 'r')
    string = src_file.read()
    src_file.close()
    if aIsCompiled:
        string = string.replace('<!-- DEV START -->', '<!--  DEV START   ')
        string = string.replace('<!-- DEV END -->', '   DEV END -->')
        string = string.replace('<!-- LIVE START   ', '<!-- LIVE START -->')
        string = string.replace('   LIVE END -->', '<!-- LIVE END -->')
    else:
        string = string.replace('<!--  DEV START   ', '<!-- DEV START -->')
        string = string.replace('   DEV END -->', '<!-- DEV END -->')
        string = string.replace('<!-- LIVE START -->', '<!-- LIVE START   ')
        string = string.replace('<!-- LIVE END -->', '   LIVE END -->')
    dst_file = open(aFilePath, 'w')
    dst_file.write(string)
    dst_file.close()


# ---------- Toggles Comments for a section html and xmls  -------------------------------------
def updateCompileMode(aHtmlPath):
    setCompiled(aHtmlPath, isSetAsCompiled)


# ---------- Begin compiler -------------------------------------
# lvNOTE : rewrite the path stuff as this is really ugly.

htmlPath = deployPath+"/index.html"

if isSetAsCompiled:
    compilePath = deployPath+jsPath+jsCompiledDir

    print "Compiling desktop ..."
    compileDesktop(htmlPath, compilePath)

updateCompileMode(htmlPath)

