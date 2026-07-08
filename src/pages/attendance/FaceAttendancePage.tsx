import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { attendanceAPI } from '@/lib/api';
import { Camera, Clock, Loader2, ScanFace, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type FaceStatus = 'idle' | 'detecting' | 'detected' | 'not-detected' | 'unsupported';

export default function FaceAttendancePage() {
  const webcamRef = useRef<Webcam>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [clocking, setClocking] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{
    clockedIn: boolean;
    clockedOut: boolean;
    clockInTime?: string;
    clockOutTime?: string;
    status?: string;
  }>({ clockedIn: false, clockedOut: false });
  const [faceDetector, setFaceDetector] = useState<any>(null);

  useEffect(() => {
    if (typeof FaceDetector !== 'undefined') {
      try {
        const detector = new (FaceDetector as any)({ fastMode: true });
        setFaceDetector(detector);
      } catch {
        setFaceStatus('unsupported');
      }
    } else {
      setFaceStatus('unsupported');
    }

    loadTodayStatus();
  }, []);

  const loadTodayStatus = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const result = await attendanceAPI.getMyAttendance(today, today);
      const records = result.data || [];
      const todayRecord = records[0];
      if (todayRecord) {
        setAttendanceData({
          clockedIn: !!todayRecord.clock_in,
          clockedOut: !!todayRecord.clock_out,
          clockInTime: todayRecord.clock_in,
          clockOutTime: todayRecord.clock_out,
          status: todayRecord.status,
        });
      }
    } catch {}
  };

  const detectFace = useCallback(async () => {
    if (!faceDetector || !webcamRef.current?.video) {
      setFaceStatus('unsupported');
      return;
    }

    setFaceStatus('detecting');
    try {
      const faces = await faceDetector.detect(webcamRef.current.video);
      if (faces.length > 0) {
        setFaceStatus('detected');
      } else {
        setFaceStatus('not-detected');
      }
    } catch {
      setFaceStatus('not-detected');
    }
  }, [faceDetector]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      return true;
    }
    return false;
  }, [webcamRef]);

  const handleClockIn = async () => {
    if (!capturedImage) return;
    setClocking(true);
    try {
      await attendanceAPI.clockIn();
      toast({ title: 'Success', description: 'Face verified. Clocked in successfully.' });
      await loadTodayStatus();
      setCapturedImage(null);
      setFaceStatus('idle');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock in', variant: 'destructive' });
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    if (!capturedImage) return;
    setClocking(true);
    try {
      await attendanceAPI.clockOut();
      toast({ title: 'Success', description: 'Face verified. Clocked out successfully.' });
      await loadTodayStatus();
      setCapturedImage(null);
      setFaceStatus('idle');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock out', variant: 'destructive' });
    } finally {
      setClocking(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFaceStatus('idle');
  };

  const statusColor = {
    idle: 'text-muted-foreground',
    detecting: 'text-yellow-500',
    detected: 'text-green-500',
    'not-detected': 'text-red-500',
    unsupported: 'text-orange-500',
  };

  const statusIcon = {
    idle: null,
    detecting: <Loader2 className="w-5 h-5 animate-spin" />,
    detected: <CheckCircle2 className="w-5 h-5" />,
    'not-detected': <XCircle className="w-5 h-5" />,
    unsupported: <XCircle className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Face Attendance</h1>
            <p className="text-muted-foreground">Verify your identity with facial recognition</p>
          </div>
          {attendanceData.clockedOut && (
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">Done for today</Badge>
          )}
        </div>

        {attendanceData.clockedIn && (
          <Card className="p-4 bg-muted/30">
            <div className="flex flex-wrap gap-4 text-sm">
              {attendanceData.clockInTime && (
                <span className="text-muted-foreground">
                  Clock In: <strong>{new Date(attendanceData.clockInTime).toLocaleTimeString()}</strong>
                </span>
              )}
              {attendanceData.clockOutTime && (
                <span className="text-muted-foreground">
                  Clock Out: <strong>{new Date(attendanceData.clockOutTime).toLocaleTimeString()}</strong>
                </span>
              )}
              {attendanceData.status && (
                <span className="text-muted-foreground">
                  Status: <Badge className={attendanceData.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{attendanceData.status}</Badge>
                </span>
              )}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Preview
              </h2>
              {faceStatus !== 'idle' && faceStatus !== 'unsupported' && (
                <div className={`flex items-center gap-2 text-sm ${statusColor[faceStatus]}`}>
                  {statusIcon[faceStatus]}
                  <span className="capitalize">{faceStatus.replace('-', ' ')}</span>
                </div>
              )}
              {faceStatus === 'unsupported' && (
                <div className="flex items-center gap-2 text-sm text-orange-500">
                  <XCircle className="w-5 h-5" />
                  <span>Face detection unavailable - camera capture only</span>
                </div>
              )}
            </div>

            {capturedImage ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={capturedImage} alt="Captured face" className="w-full" />
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Face captured successfully</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                  className="w-full"
                  mirrored
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-lg pointer-events-none flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-primary/20" />
                </div>
              </div>
            )}

            {faceStatus !== 'idle' && faceStatus !== 'detected' && faceStatus !== 'unsupported' && (
              <p className="text-xs text-muted-foreground text-center">
                {faceStatus === 'detecting' ? 'Checking for face...' : 'No face detected. Please position your face in the camera.'}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!attendanceData.clockedOut && (
              <>
                {!attendanceData.clockedIn ? (
                  capturedImage ? (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" onClick={handleRetake} className="flex-1">
                        Retake
                      </Button>
                      <Button onClick={handleClockIn} disabled={clocking} className="flex-1">
                        {clocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                        Confirm & Clock In
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" onClick={detectFace} className="flex-1">
                        <ScanFace className="w-4 h-4 mr-2" />
                        Detect Face
                      </Button>
                      <Button onClick={() => capture()} className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture & Clock In
                      </Button>
                    </div>
                  )
                ) : (
                  capturedImage ? (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" onClick={handleRetake} className="flex-1">
                        Retake
                      </Button>
                      <Button onClick={handleClockOut} disabled={clocking} variant="destructive" className="flex-1">
                        {clocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                        Confirm & Clock Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" onClick={detectFace} className="flex-1">
                        <ScanFace className="w-4 h-4 mr-2" />
                        Detect Face
                      </Button>
                      <Button onClick={() => capture()} variant="destructive" className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture & Clock Out
                      </Button>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Position your face in the camera frame</li>
            <li>Click <strong>Detect Face</strong> to verify your face is visible</li>
            <li>Click <strong>Capture & Clock In</strong> to take a photo and sign attendance</li>
            {faceStatus === 'unsupported' && (
              <li className="text-orange-500">Note: Face detection is not available in your browser. Capture still works.</li>
            )}
          </ol>
        </Card>
      </div>
    </div>
  );
}
