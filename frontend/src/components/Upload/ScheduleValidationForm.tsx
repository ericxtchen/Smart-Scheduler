import { Accordion, TextInput, Group, Button, Stack, Text, Select, Card, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Course, ScheduleMeeting, FullParsingResult } from '../../types/schedule';

interface ValidationFormProps {
  scheduleData: FullParsingResult,
  setScheduleData: (data: FullParsingResult) => void,
  onFinalSubmit: () => void,
  isSubmitting: boolean
}

export function ScheduleValidationForm({ scheduleData, setScheduleData, onFinalSubmit, isSubmitting }: ValidationFormProps) {
  const handleCourseChange = (courseIndex: number, field: keyof Course, value: any) => {
    const newCourses = [...scheduleData.courses];
    newCourses[courseIndex] = { ...newCourses[courseIndex], [field]: value };
    setScheduleData({ ...scheduleData, courses: newCourses });
  };

  const handleMeetingChange = (courseIndex: number, meetingIndex: number, field: keyof ScheduleMeeting, value: string) => {
    const newCourses = [...scheduleData.courses];
    const newMeetings = [...newCourses[courseIndex].schedule];
    newMeetings[meetingIndex] = { ...newMeetings[meetingIndex], [field]: value };
    handleCourseChange(courseIndex, 'schedule', value)
  }

  const removeCourse = (courseIndex: number) => {
    const newCourses = scheduleData.courses.filter((_, index) => index !== courseIndex);
    setScheduleData({ ...scheduleData, courses: newCourses });
  }

  return (
    <Stack>
      <Text size="lg" fw={700}>Please review your schedule</Text>
      <Text c="dimmed" size="sm">The AI has parsed your schedule. Please review and correct any errors before saving.</Text>

      <Accordion variant="separated" multiple defaultValue={scheduleData.courses.map(c => c.courseCode)}>
        {scheduleData.courses.map((course, courseIndex) => (
          <Accordion.Item key={courseIndex} value={course.courseCode}>
            <Accordion.Control>
              <Group justify="space-between">
                <Text fw={500}>{course.courseCode}: {course.courseName}</Text>
                <ActionIcon color="red" variant="subtle" onClick={() => removeCourse(courseIndex)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Group grow>
                  <TextInput
                    label="Course Code"
                    value={course.courseCode}
                    onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.currentTarget.value)}
                  />
                  <TextInput
                    label="Course Name"
                    value={course.courseName}
                    onChange={(e) => handleCourseChange(courseIndex, 'courseName', e.currentTarget.value)}
                  />
                </Group>
                <TextInput
                  label="Instructor"
                  value={course.instructor || ''}
                  onChange={(e) => handleCourseChange(courseIndex, 'instructor', e.currentTarget.value)}
                />
                <Text fw={500} mt="xs">Meetings</Text>
                {course.schedule.map((meeting, meetingIndex) => (
                  <Card withBorder p="xs" key={meetingIndex}>
                    <Group grow>
                      <Select
                        label="Day"
                        data={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                        value={meeting.dayOfWeek}
                        onChange={(value) => handleMeetingChange(courseIndex, meetingIndex, 'dayOfWeek', value || 'monday')}
                      />
                      <TextInput label="Start Time" value={meeting.startTime} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'startTime', e.currentTarget.value)} />
                      <TextInput label="End Time" value={meeting.endTime} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'endTime', e.currentTarget.value)} />
                      <TextInput label="Location" value={meeting.location} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'location', e.currentTarget.value)} />
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Button mt="md" onClick={onFinalSubmit} loading={isSubmitting}>
        Confirm and Save Schedule
      </Button><Text size="lg" fw={700}>Please review your schedule</Text>
      <Text c="dimmed" size="sm">The AI has parsed your schedule. Please review and correct any errors before saving.</Text>

      <Accordion variant="separated" multiple defaultValue={scheduleData.courses.map(c => c.courseCode)}>
        {scheduleData.courses.map((course, courseIndex) => (
          <Accordion.Item key={courseIndex} value={course.courseCode}>
            <Accordion.Control>
              <Group justify="space-between">
                <Text fw={500}>{course.courseCode}: {course.courseName}</Text>
                <ActionIcon color="red" variant="subtle" onClick={() => removeCourse(courseIndex)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Group grow>
                  <TextInput
                    label="Course Code"
                    value={course.courseCode}
                    onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.currentTarget.value)}
                  />
                  <TextInput
                    label="Course Name"
                    value={course.courseName}
                    onChange={(e) => handleCourseChange(courseIndex, 'courseName', e.currentTarget.value)}
                  />
                </Group>
                <TextInput
                  label="Instructor"
                  value={course.instructor || ''}
                  onChange={(e) => handleCourseChange(courseIndex, 'instructor', e.currentTarget.value)}
                />
                <Text fw={500} mt="xs">Meetings</Text>
                {course.schedule.map((meeting, meetingIndex) => (
                  <Card withBorder p="xs" key={meetingIndex}>
                    <Group grow>
                      <Select
                        label="Day"
                        data={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
                        value={meeting.dayOfWeek}
                        onChange={(value) => handleMeetingChange(courseIndex, meetingIndex, 'dayOfWeek', value || 'monday')}
                      />
                      <TextInput label="Start Time" value={meeting.startTime} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'startTime', e.currentTarget.value)} />
                      <TextInput label="End Time" value={meeting.endTime} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'endTime', e.currentTarget.value)} />
                      <TextInput label="Location" value={meeting.location} onChange={(e) => handleMeetingChange(courseIndex, meetingIndex, 'location', e.currentTarget.value)} />
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Button mt="md" onClick={onFinalSubmit} loading={isSubmitting}>
        Confirm and Save Schedule
      </Button>
    </Stack>
  )
}
