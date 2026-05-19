import { MedicalRecord, formatVisitDate } from '@/lib/medicalRecords';

type Props = {
  records: MedicalRecord[];
};

export default function MedicalTimeline({ records }: Props) {
  if (records.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        No medical history recorded yet for this pet.
      </p>
    );
  }

  return (
    <ol className="relative border-l-2 border-[#ec6d13]/30 pl-6">
      {records.map((record) => (
        <li key={record.id} className="mb-8 ml-2 last:mb-0">
          <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#ec6d13]" />
          <time className="text-sm font-semibold text-[#ec6d13]">
            {formatVisitDate(record.visitDate)}
          </time>
          {record.doctorName ? (
            <p className="mt-1 text-sm text-gray-600">
              Dr. {record.doctorName}
              {record.specialization ? ` · ${record.specialization}` : ''}
            </p>
          ) : null}
          {record.diagnosis ? (
            <RecordSection title="Diagnosis" text={record.diagnosis} />
          ) : null}
          {record.treatment ? (
            <RecordSection title="Treatment" text={record.treatment} />
          ) : null}
          {record.consultationNotes ? (
            <RecordSection title="Consultation notes" text={record.consultationNotes} />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function RecordSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</h4>
      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{text}</p>
    </div>
  );
}
