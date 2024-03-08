import cv from "opencv-ts";
import { onMessage } from 'opencv-tools/workers/correct'

onmessage = onMessage(cv)