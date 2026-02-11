  import React, { useEffect, useState, useRef } from "react";
  import { useFormik } from "formik";
  import { z } from "zod";
  import { toFormikValidationSchema } from "zod-formik-adapter";
  import { toast } from "react-hot-toast";
  import { Input } from "@/components/ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Label } from "@/components/ui/label";
  import DatePicker from "@/components/ui/DatePicker";
  import { Button } from "@/components/ui/button";
  import {
    useUpdateEventKeyDetailsMutation,
    useGetEventTypeMutation,
  } from "@/redux/features/Events_api";
  import { useGetKeyDetailsMutation } from "@/redux/features/Events_api";
  import { useParams } from "next/navigation";
  import {
    useCountriesDataMutation,
    useGetCitiesMutation,
    useGetCurrencyMutation,
  } from "@/redux/features/venues-api";

  interface Country {
    id: string;
    name: string;
  }
  interface City {
    city: string;
  }
  interface Currency {
    currency: string;
  }
  interface EventType {
    name: string;
  }
  interface FormValues {
    event_edition_name: string;
    event_type: string;
    country: string;
    city: string;
    event_date: Date;
    event_close_date: Date;
    event_start_time: string;
    registration_closure_time: string;
    currency: string;
    name_of_organizer: string;
    contact_person: string;
    event_contact_email: string;
    contact_number: string;
    whatsapp_number: string;
    event_website_link: string;
    registration_close_date: Date;
    store_close_date: Date;
    registration_fee_includes: string[];
    registration_fee_also_includes: string;
    event_location: string;
    event_introduction: string;
    tracking_pixel_event_page: string;
    tracking_pixel_confirmation: string;
    google_tag_manager_id: string;
  }

  const registrationFeeOptions = [
    { id: "timing", label: "Timing" },
    { id: "certificate", label: "Certificate" },
    { id: "medal", label: "Medal" },
    { id: "photo_service", label: "Photo Service or Download" },
    { id: "live_results", label: "Live Results" },
    { id: "goody_bag", label: "Goody Bag" },
    { id: "refreshments", label: "Refreshments" },
  ];

  const schema = z.object({
    event_edition_name: z.string().min(1, "Event edition name is required"),
    event_type: z.string().min(1, "Event type is required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    event_date: z.date({ required_error: "Event date is required" }),
    event_close_date: z.date({ required_error: "Event close date is required" }),
    event_start_time: z.string().min(1, "Start time is required"),
    registration_closure_time: z.string().min(1, "Registration closure time is required"),
    currency: z.string().min(1, "Currency is required"),
    name_of_organizer: z.string().min(5, "Please enter at least 5 characters."),
    contact_person: z.string().min(1, "Contact person is required"),
    event_contact_email: z.string().email("Invalid email").min(1, "Email is required"),
    contact_number: z.string().min(1, "Contact number is required"),
    whatsapp_number: z.string().min(1, "WhatsApp number is required"),
    event_website_link: z.string().url("Invalid URL").optional().or(z.literal("")),
    registration_close_date: z.date({ required_error: "Registration close date is required" }),
    store_close_date: z.date({ required_error: "Store close date is required" }),
    registration_fee_includes: z.array(z.string()).nonempty("At least one option is required"),
    registration_fee_also_includes: z.string().optional(),
    event_location: z.string().url("Invalid Google Maps link").optional().or(z.literal("")),
    tracking_pixel_event_page: z.string().optional(),
    tracking_pixel_confirmation: z.string().optional(),
    google_tag_manager_id: z.string().optional(),
    event_introduction: z.string().optional(),
  });

  const today = new Date();

  interface KeyDetailsFormProps {
    initialValues?: Partial<FormValues>;
  }

  export default function KeyDetailsForm({ initialValues }: KeyDetailsFormProps) {
    const { id } = useParams();
    const eventId = id as string;
    const [savingField, setSavingField] = useState<string | null>(null);
    const [localKeyDetails, setLocalKeyDetails] = useState<Partial<FormValues> | null>(null);
    const [isFeeOptionsOpen, setIsFeeOptionsOpen] = useState(false);
    const [updateEventKeyDetails] = useUpdateEventKeyDetailsMutation();
    const [getKeyDetails] = useGetKeyDetailsMutation();
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
    const [getCountries] = useCountriesDataMutation();
    const [getCities] = useGetCitiesMutation();
    const [getCurrencies] = useGetCurrencyMutation();
    const [getEventTypes] = useGetEventTypeMutation();
    const [isManualCity, setIsManualCity] = useState(false);
    const [manualCity, setManualCity] = useState("");

    const formik = useFormik<FormValues>({
      initialValues: {
        event_edition_name: "",
        event_type: "",
        country: "",
        city: "",
        event_date: today,
        event_close_date: today,
        event_start_time: "",
        registration_closure_time: "",
        currency: "",
        name_of_organizer: "",
        contact_person: "",
        event_contact_email: "",
        contact_number: "",
        whatsapp_number: "",
        event_website_link: "",
        registration_close_date: today,
        store_close_date: today,
        registration_fee_includes: [],
        registration_fee_also_includes: "",
        event_location: "",
        event_introduction: "",
        tracking_pixel_event_page: "",
        tracking_pixel_confirmation: "",
        google_tag_manager_id: "",
        ...initialValues,
      },
      validationSchema: toFormikValidationSchema(schema),
      onSubmit: async (values) => {
        toast.success("Form submitted!");
      },
      validateOnBlur: true,
      validateOnChange: false,
    });

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };


    // console.log('eventTypes', eventTypes)

    const handleFieldBlur = async (field: string, value: any) => {
      await formik.setFieldTouched(field, true);
      if (formik.errors[field as keyof FormValues]) {
        return;
      }
      if (value === undefined || value === "") return;

      console.log('formik', formik)
      const payload:any = {
        ...formik.values,
        event_id: eventId,
        [field]: value,
        
      };

      try {
        setSavingField(field);
        await updateEventKeyDetails(payload).unwrap();
      } catch (error) {
      } finally {
        setSavingField(null);
      }
    };
  useEffect(() => {
    
    if (!isFeeOptionsOpen && formik.touched.registration_fee_includes) {
      handleFieldBlur("registration_fee_includes", formik.values.registration_fee_includes);
    }
  }, [isFeeOptionsOpen]);
  useEffect(() => {
    if (!isFeeOptionsOpen) return;     

    const handle = (e: MouseEvent) => {
      const box = document.getElementById("fee-options-dropdown");
      if (box && !box.contains(e.target as Node)) {
        setIsFeeOptionsOpen(false);     
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isFeeOptionsOpen]);
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          const citiesResponse = await getCities({ country_id: formik.values.country }).unwrap();
          setCities(citiesResponse.data || []);
          const [countriesResponse, currenciesResponse, eventTypesResponse] = await Promise.all([
            getCountries({ type: "venue" }).unwrap(),
            getCurrencies({ type: "venue" }).unwrap(),
            getEventTypes({}).unwrap(),
          ]);
          setCountries(countriesResponse.data || []);
          setCurrencies(currenciesResponse.currencies || []);
          setEventTypes(eventTypesResponse.data || []);
          setIsInitialDataLoaded(true);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      };
      fetchInitialData();
    }, []);

    useEffect(() => {
      if (!isInitialDataLoaded) return;
      const fetchKeyDetails = async () => {
        try {
          const response = await getKeyDetails({ event_id: eventId }).unwrap();
          const transformedData = transformResponseToFormValues(response);
          formik.setValues(transformedData);
          setLocalKeyDetails(transformedData);
        } catch (error) {
          console.error("Error fetching key details:", error);
        }
      };
      fetchKeyDetails();
    }, [eventId, isInitialDataLoaded]);

    const transformResponseToFormValues = (response: any) => {
      const eventData = response.event_data;
      const details = eventData.details;
      const parseDate = (dateValue: string | number | null | undefined): Date => {
        if (!dateValue || dateValue === "0") return new Date();
        const ts = Number(dateValue) * 1000;
        const d = new Date(ts);
        return isNaN(d.getTime()) ? new Date() : d;
      };
      const countryName = countries.find((c) => c.id === String(eventData.country_id))?.name || "";
      const eventType = eventTypes.find((type) => type.name === eventData.race_type)?.name || "";
      const currency = currencies.find((curr) => curr.currency === eventData.currency)?.currency || "";
      const parseFeeIncludes = (raw: any): string[] => {
        if (!raw) return [];
        let parsed: unknown[] = [];
        if (Array.isArray(raw)) {
          parsed = raw;
        } else if (typeof raw === "string") {
          try {
            const first = JSON.parse(raw);
            if (Array.isArray(first)) {
              parsed = first;
            } else if (typeof first === "string") {
              parsed = JSON.parse(first);
            }
          } catch {
            parsed = [];
          }
        }
        const flat = Array.isArray(parsed) ? parsed.flat() : [];
        const valid = flat.filter((id) => typeof id === "string" && registrationFeeOptions.some((opt) => opt.id === id));
        return [...new Set(valid)];
      };
      const feeIncludes = parseFeeIncludes(details.registration_fee_includes);
      return {
        event_edition_name: eventData.title || "",
        event_type: eventType,
        country: countryName,
        city: eventData.city || "",
        event_date: parseDate(eventData.race_day),
        event_close_date: parseDate(eventData.event_close_date),
        event_start_time: details.start_times || "",
        registration_closure_time: details.close_time || "",
        currency: currency,
        name_of_organizer: details.contact_name_of_organizer || "",
        contact_person: details.contact_person || "",
        event_contact_email: details.contact_email || "",
        contact_number: details.contact_tel_1 || "",
        whatsapp_number: details.contact_whatsApp || "",
        event_website_link: details.event_website || "",
        registration_close_date: parseDate(details.registration_close_date),
        store_close_date: parseDate(eventData.store_closure_date),
        registration_fee_includes: feeIncludes,
        registration_fee_also_includes: details.registration_fee_includes_other || "",
        event_location: details.location_url || "",
        event_introduction: details.event_overview || "",
        tracking_pixel_event_page: details.tracking_pixel_1 || "",
        tracking_pixel_confirmation: details.tracking_pixel_2 || "",
        google_tag_manager_id: details.google_tag_id || "",
      };
    };

    const labelClass = "block mb-2 text-sm font-medium text-gray-700";
    const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none ";

    return (
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Event Details */}
        <div className="bg-white p-6 space-y-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Edit Event</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Event Edition Name</Label>
              <div className="relative">
                <Input
                  name="event_edition_name"
                  className={`${inputClass} ${
                    formik.errors.event_edition_name && formik.touched.event_edition_name ? "border-red-500" : ""
                  }`}
                  value={formik.values.event_edition_name}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("event_edition_name", formik.values.event_edition_name)}
                />
                {formik.errors.event_edition_name && formik.touched.event_edition_name && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.event_edition_name && formik.touched.event_edition_name && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_edition_name}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Event Type</Label>
              <div className="relative">
                {/* talha */}
                {/* <Select
                  value={formik.values.event_type}
                  onValueChange={(val: string) => {
                    formik.setFieldValue("event_type", val);
                    formik.setFieldTouched("event_type", true);
                  }}
                >
                  <SelectTrigger
                    className={`${inputClass} ${
                      formik.errors.event_type && formik.touched.event_type ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select event type">{formik.values.event_type}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event_type: EventType) => (
                      <SelectItem key={event_type.name} value={event_type.name}>
                        {event_type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.errors.event_type && formik.touched.event_type && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )} */}
                <Select
                  value={formik.values.event_type}
                  onValueChange={(val: string) => {
                    formik.setFieldValue("event_type", val);
                    handleFieldBlur("event_type", val); 
                  }}
                >
                  <SelectTrigger
                    className={`${inputClass} ${
                      formik.errors.event_type && formik.touched.event_type ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event_type: EventType) => (
                      <SelectItem key={event_type.name} value={event_type.name}>
                        {event_type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                

              </div>
              {formik.errors.event_type && formik.touched.event_type && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_type}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Country</Label>
              <div className="relative">
                <Select
                  value={formik.values.country}
                  onValueChange={(val: string) => {
                    formik.setFieldValue("country", val);
                    handleFieldBlur("country", val); 
                  }}
                >
                  <SelectTrigger
                    className={`${inputClass} ${
                      formik.errors.country && formik.touched.country ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select country">{formik.values.country}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country: Country) => (
                      <SelectItem key={country.id} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              
              </div>
              {formik.errors.country && formik.touched.country && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.country}</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>City</Label>
              <div className="relative">
                <Input
                  name="city"
                  className={`${inputClass} ${
                    formik.errors.city && formik.touched.city ? "border-red-500" : ""
                  }`}
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("city", formik.values.city)}
                />
                {formik.errors.city && formik.touched.city && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.city && formik.touched.city && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.city}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Event Date</Label>
              <div className="relative">
                <DatePicker
                  className={`${inputClass} ${
                    formik.errors.event_date && formik.touched.event_date ? "border-red-500" : ""
                  }`}
                  value={formik.values.event_date}
                  onChange={(val: Date | undefined) => {
                    formik.setFieldValue("event_date", val || today);
                    formik.setFieldTouched("event_date", true);
                  }}
                  fromDate={today}
                />
                {formik.errors.event_date && formik.touched.event_date && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              
            </div>
            <div>
              <Label className={labelClass}>Event Close Date</Label>
              <div className="relative">
                <DatePicker
                  className={`${inputClass} ${
                    formik.errors.event_close_date && formik.touched.event_close_date ? "border-red-500" : ""
                  }`}
                  value={formik.values.event_close_date}
                  onChange={(val: Date | undefined) => {
                    formik.setFieldValue("event_close_date", val || today);
                    formik.setFieldTouched("event_close_date", true);
                  }}
                  fromDate={formik.values.event_date}
                />
                {formik.errors.event_close_date && formik.touched.event_close_date && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
            
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Event Start Time</Label>
              <div className="relative">
                <input
                  type="time"
                  name="event_start_time"
                  className={`${inputClass} ${
                    formik.errors.event_start_time && formik.touched.event_start_time ? "border-red-500" : ""
                  }`}
                  value={formik.values.event_start_time}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("event_start_time", formik.values.event_start_time)}
                />
              
              </div>
              {formik.errors.event_start_time && formik.touched.event_start_time && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_start_time}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Registration Closure Time</Label>
              <div className="relative">
                <input
                  type="time"
                  name="registration_closure_time"
                  className={`${inputClass} ${
                    formik.errors.registration_closure_time && formik.touched.registration_closure_time
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.registration_closure_time}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("registration_closure_time", formik.values.registration_closure_time)}
                />
              
              </div>
              {formik.errors.registration_closure_time && formik.touched.registration_closure_time && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.registration_closure_time}</p>
              )}
            </div>
          </div>
        </div>

        {/* Organizer Details */}
        <div className="bg-white p-6 space-y-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Organizer</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Currency</Label>
              <div className="relative">
                <Select
                  value={formik.values.currency}
                  onValueChange={(val: string) => {
                    formik.setFieldValue("currency", val);
                    handleFieldBlur("currency", val)
                  }}
                >
                  <SelectTrigger
                    className={`${inputClass} ${
                      formik.errors.currency && formik.touched.currency ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select currency">{formik.values.currency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency: Currency) => (
                      <SelectItem key={currency.currency} value={currency.currency}>
                        {currency.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            
              </div>
              {formik.errors.currency && formik.touched.currency && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.currency}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Name of Organizer</Label>
              <div className="relative">
                <Input
                  name="name_of_organizer"
                  className={`${inputClass} ${
                    formik.errors.name_of_organizer && formik.touched.name_of_organizer ? "border-red-500" : ""
                  }`}
                  value={formik.values.name_of_organizer}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("name_of_organizer", formik.values.name_of_organizer)}
                />
                {formik.errors.name_of_organizer && formik.touched.name_of_organizer && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.name_of_organizer && formik.touched.name_of_organizer && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.name_of_organizer}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Contact Person</Label>
              <div className="relative">
                <Input
                  name="contact_person"
                  className={`${inputClass} ${
                    formik.errors.contact_person && formik.touched.contact_person ? "border-red-500" : ""
                  }`}
                  value={formik.values.contact_person}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("contact_person", formik.values.contact_person)}
                />
                {formik.errors.contact_person && formik.touched.contact_person && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.contact_person && formik.touched.contact_person && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.contact_person}</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Event Contact Email (non-public)</Label>
              <div className="relative">
                <Input
                  name="event_contact_email"
                  type="email"
                  className={`${inputClass} ${
                    formik.errors.event_contact_email && formik.touched.event_contact_email ? "border-red-500" : ""
                  }`}
                  value={formik.values.event_contact_email}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("event_contact_email", formik.values.event_contact_email)}
                />
                {formik.errors.event_contact_email && formik.touched.event_contact_email && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.event_contact_email && formik.touched.event_contact_email && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_contact_email}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Contact Number</Label>
              <div className="relative">
                <Input
                  name="contact_number"
                  type="tel"
                  className={`${inputClass} ${
                    formik.errors.contact_number && formik.touched.contact_number ? "border-red-500" : ""
                  }`}
                  value={formik.values.contact_number}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("contact_number", formik.values.contact_number)}
                />
                {formik.errors.contact_number && formik.touched.contact_number && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.contact_number && formik.touched.contact_number && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.contact_number}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>WhatsApp Number</Label>
              <div className="relative">
                <Input
                  name="whatsapp_number"
                  type="tel"
                  className={`${inputClass} ${
                    formik.errors.whatsapp_number && formik.touched.whatsapp_number ? "border-red-500" : ""
                  }`}
                  value={formik.values.whatsapp_number}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur("whatsapp_number", formik.values.whatsapp_number)}
                />
                {formik.errors.whatsapp_number && formik.touched.whatsapp_number && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.whatsapp_number && formik.touched.whatsapp_number && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.whatsapp_number}</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Event Website Link</Label>
              <Input
                name="event_website_link"
                type="url"
                className={inputClass}
                value={formik.values.event_website_link}
                onChange={formik.handleChange}
                onBlur={() => handleFieldBlur("event_website_link", formik.values.event_website_link)}
              />
              {formik.errors.event_website_link && formik.touched.event_website_link && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_website_link}</p>
              )}
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-white p-6 space-y-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Registration Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Registration Close Date</Label>
              <div className="relative">
                <DatePicker
                  className={`${inputClass} ${
                    formik.errors.registration_close_date && formik.touched.registration_close_date
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.registration_close_date}
                  onChange={(val: Date | undefined) => {
                    formik.setFieldValue("registration_close_date", val || today);
                    formik.setFieldTouched("registration_close_date", true);
                  }}
                  fromDate={formik.values.event_date}
                />
                {formik.errors.registration_close_date && formik.touched.registration_close_date && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.registration_close_date && formik.touched.registration_close_date && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.registration_close_date}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>Store Close Date</Label>
              <div className="relative">
                <DatePicker
                  className={`${inputClass} ${
                    formik.errors.store_close_date && formik.touched.store_close_date ? "border-red-500" : ""
                  }`}
                  value={formik.values.store_close_date}
                  onChange={(val: Date | undefined) => {
                    formik.setFieldValue("store_close_date", val || today);
                    formik.setFieldTouched("store_close_date", true);
                  }}
                  fromDate={formik.values.event_date}
                />
                {formik.errors.store_close_date && formik.touched.store_close_date && (
                  <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-red-500">❗</div>
                )}
              </div>
              {formik.errors.store_close_date && formik.touched.store_close_date && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.store_close_date}</p>
              )}
            </div>
            <div id="fee-options-dropdown" className="relative">
              <Label className={labelClass}>Registration Fee Includes</Label>
              <div
                className={`border border-gray-300 rounded-lg p-2.5 cursor-pointer bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formik.errors.registration_fee_includes && formik.touched.registration_fee_includes
                    ? "border-red-500"
                    : ""
                }`}
                onClick={() => setIsFeeOptionsOpen(!isFeeOptionsOpen)}
              >
                {formik.values.registration_fee_includes.length > 0 ? (
                  <div
                    className="truncate text-sm text-gray-700"
                    title={formik.values.registration_fee_includes
                      .map((id) => registrationFeeOptions.find((o) => o.id === id)?.label)
                      .join(", ")}
                  >
                    {formik.values.registration_fee_includes.length
                      ? formik.values.registration_fee_includes
                          .map((id) => registrationFeeOptions.find((o) => o.id === id)?.label)
                          .join(", ")
                      : <span className="text-gray-400">Select options</span>}
                  </div>
                ) : (
                  <span className="text-gray-400">Select options</span>
                )}
              </div>
              {formik.errors.registration_fee_includes && formik.touched.registration_fee_includes && (
                <div className="flex items-center mt-1">
                  <span className="text-red-500 mr-1">❗</span>
                  <div className="relative group">
                    <span className="text-red-500 text-xs cursor-help">
                      {formik.errors.registration_fee_includes}
                    </span>
                    <div className="absolute z-20 hidden group-hover:block bottom-full left-0 mb-2 w-48 p-2 text-xs text-white bg-red-500 rounded">
                      At least one option is required.
                    </div>
                  </div>
                </div>
              )}
              {isFeeOptionsOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {registrationFeeOptions.map((option) => (
                    <div key={option.id} className="flex items-center p-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={formik.values.registration_fee_includes.includes(option.id)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...formik.values.registration_fee_includes, option.id]
                            : formik.values.registration_fee_includes.filter((i) => i !== option.id);
                          formik.setFieldValue("registration_fee_includes", newValue);
                          formik.setFieldTouched("registration_fee_includes", true);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label htmlFor={option.id} className="ml-2 text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className={labelClass}>Registration Fee also Includes</Label>
              <Input
                name="registration_fee_also_includes"
                className={inputClass}
                value={formik.values.registration_fee_also_includes}
                onChange={formik.handleChange}
                onBlur={() => handleFieldBlur("registration_fee_also_includes", formik.values.registration_fee_also_includes)}
              />
            </div>
            <div>
              <Label className={labelClass}>Event Location (Google Maps)</Label>
              <Input
                name="event_location"
                type="url"
                className={inputClass}
                value={formik.values.event_location}
                onChange={formik.handleChange}
                onBlur={() => handleFieldBlur("event_location", formik.values.event_location)}
              />
              {formik.errors.event_location && formik.touched.event_location && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.event_location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Event Introduction */}
        <div className="bg-white p-6 space-y-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Event Introduction (English)</h2>
          <div className="relative">
            <textarea
              id="event_introduction"
              name="event_introduction"
              maxLength={5000}
              rows={6}
              className={`w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={formik.values.event_introduction}
              onChange={formik.handleChange}
              onBlur={() => handleFieldBlur("event_introduction", formik.values.event_introduction)}
            />
          </div>
          <div className="text-left text-sm text-gray-500 mt-1">
            {formik.values.event_introduction.length} / 5000 characters
          </div>
        </div>

        {/* Tracking Section */}
        <div className="bg-white p-6 space-y-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Tracking</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {["tracking_pixel_event_page", "tracking_pixel_confirmation", "google_tag_manager_id"].map((field) => (
              <div key={field}>
                <Label className={labelClass}>
                  {{
                    tracking_pixel_event_page: "Tracking Pixel (Event Page)",
                    tracking_pixel_confirmation: "Tracking Pixel (Confirmation)",
                    google_tag_manager_id: "Google Tag Manager ID",
                  }[field]}
                </Label>
                <Input
                  name={field}
                  className={inputClass}
                  value={formik.values[field as keyof FormValues]}
                  onChange={formik.handleChange}
                  onBlur={() => handleFieldBlur(field, formik.values[field as keyof FormValues])}
                  placeholder={field === "google_tag_manager_id" ? "GTM-XXXXXX" : ""}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    );
  }
