package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const workerCount = 16

var i int = 0
var total int = 0

var totalInputSize, totalOutputSize int64

const emotesDir = "frontend/src/assets/emotes"

func main() {

	if _, err := os.Stat(emotesDir + "_compressed"); os.IsNotExist(err) {
		fmt.Printf("Compressed emotes directory does not exist, cannot run compression...")
		os.Exit(1)
	}

	startedAt := time.Now()

	files, err := filepath.Glob(emotesDir + "/*")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	total = len(files)

	// create a channel to hold the files
	fileQueue := make(chan string, len(files))

	// create a channel to hold the results
	resultQueue := make(chan int64, len(files))

	// add the files to the fileQueue
	for _, file := range files {
		fileQueue <- file
	}
	close(fileQueue)

	// start the workerCount number of goroutines
	for i := 0; i < workerCount; i++ {
		go worker(fileQueue, resultQueue)
	}

	// wait for all the files to be processed
	for i := 0; i < len(files); i++ {
		result := <-resultQueue
		totalOutputSize += result
	}

	fmt.Printf("total: %dkb -> %dkb\n", totalInputSize, totalOutputSize)
	fmt.Printf("Savings: %dkb\n", totalInputSize-totalOutputSize)
	fmt.Printf("Took: %v\n", time.Since(startedAt))

	fmt.Printf("Removing old emotes directory...")
	err = os.RemoveAll(emotesDir)
	if err != nil {
		fmt.Printf("failed: %s", err)
	}

	fmt.Printf("Renaming compressed emotes directory...")
	err = os.Rename(emotesDir+"_compressed", emotesDir)
	if err != nil {
		fmt.Printf("failed: %s", err)
	}
}
func worker(fileQueue chan string, resultQueue chan int64) {
	for file := range fileQueue {

		outName := filepath.Base(file)
		if strings.HasSuffix(outName, ".png") {
			outName = outName[:len(outName)-4]
			outName += ".webp"
		}
		if strings.HasSuffix(outName, ".jpeg") {
			outName = outName[:len(outName)-5]
			outName += ".webp"
		}

		data := map[string]string{
			"input":  file,
			"output": filepath.Join(emotesDir+"_compressed/", outName),
		}

		cmd := exec.Command("cwebp", "-q", "20", "-mt", "4", data["input"], "-o", data["output"])

		inputSize := getFileSize(data["input"])

		err := cmd.Run()
		if err != nil {
			fmt.Printf("[%d/%d] %s - %dkb -> failed\n", i+1, total, filepath.Base(file), inputSize)
			i++
			continue
		}

		outputSize := getFileSize(data["output"])
		totalInputSize += inputSize
		resultQueue <- outputSize

		//fmt.Printf("[%d/%d] %s - %dkb -> %dkb\n", i+1, total, filepath.Base(file), inputSize, outputSize)
		i++
	}
}

func getFileSize(file string) int64 {
	fi, err := os.Stat(file)
	if err != nil {
		return 0
	}
	return fi.Size() / 1024
}
